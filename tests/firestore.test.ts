import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, runTransaction } from 'firebase/firestore';

const emulator = process.env.FIRESTORE_EMULATOR_HOST;
describe.skipIf(!emulator)('Firestore authorization and transaction regressions', () => {
  let env: RulesTestEnvironment;
  const profile = (uid='parent-1', username='kaien') => ({ user_id:uid,username,parent_name:'0',child_name:'KaiEn',contact_phone:'0',
    activation_code:'BEE-test',spelling_bee_enabled:false,ai_features_enabled:false,bee_tokens:0,created_at:new Date().toISOString() });
  const parent = (uid='parent-1',name='kaien',auth_time=200) => env.authenticatedContext(uid,{email:name+'@parents.littlebee.app',auth_time}).firestore();
  const staff = () => env.authenticatedContext('admin',{email:'admin@lb.com',auth_time:200}).firestore();
  beforeAll(async()=> { env=await initializeTestEnvironment({projectId:'demo-little-bee',firestore:{rules:readFileSync('firestore.rules','utf8'),host:'127.0.0.1',port:8080}}); });
  afterAll(async()=>env?.cleanup());
  beforeEach(async()=>{
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async context=> {
      const db=context.firestore();
      await setDoc(doc(db,'staff_users','admin@lb.com'),{user_id:'admin',active:true,role:'admin'});
      await setDoc(doc(db,'parent_profiles','kaien'),profile());
      await setDoc(doc(db,'parent_profiles','olivia'),profile('parent-2','olivia'));
    });
  });
  it('denies anonymous roster reads, staff writes and maintenance writes',async()=>{
    const db=env.unauthenticatedContext().firestore();
    await assertFails(getDocs(collection(db,'parent_profiles')));
    await assertFails(setDoc(doc(db,'staff_users','admin@evil.test'),{active:true,role:'admin'}));
    await assertFails(setDoc(doc(db,'app_settings','system_maintenance'),{config:{isActive:true}}));
  });
  it('allows only own parent data and basic profile edits',async()=>{
    const db=parent();
    await assertSucceeds(getDoc(doc(db,'parent_profiles','kaien')));
    await assertFails(getDoc(doc(db,'parent_profiles','olivia')));
    await assertSucceeds(updateDoc(doc(db,'parent_profiles','kaien'),{child_name:'Kai En'}));
    await assertFails(updateDoc(doc(db,'parent_profiles','kaien'),{bee_tokens:100,spelling_bee_enabled:true}));
    await assertFails(updateDoc(doc(db,'parent_profiles','kaien'),{password:'plaintext'}));
  });
  it('enforces the staff UID and active status, even for admin@ emails',async()=>{
    await assertSucceeds(getDocs(collection(staff(),'parent_profiles')));
    const forged=env.authenticatedContext('wrong-uid',{email:'admin@lb.com'}).firestore();
    await assertFails(getDocs(collection(forged,'parent_profiles')));
    await env.withSecurityRulesDisabled(async c=>updateDoc(doc(c.firestore(),'staff_users','admin@lb.com'),{active:false}));
    await assertFails(getDocs(collection(staff(),'parent_profiles')));
  });
  it('allows new registration only with zero privileges and the Auth UID',async()=>{
    const db=parent('new-user','newstudent');
    await assertFails(setDoc(doc(db,'parent_profiles','newstudent'),{...profile('new-user','newstudent'),bee_tokens:100}));
    await assertSucceeds(setDoc(doc(db,'parent_profiles','newstudent'),profile('new-user','newstudent')));
    await assertFails(setDoc(doc(db,'parent_profiles','kaien'),profile('new-user','kaien')));
  });
  it('revokes profile access after password reset or disable',async()=>{
    await env.withSecurityRulesDisabled(async c=>updateDoc(doc(c.firestore(),'parent_profiles','kaien'),{auth_valid_after:300}));
    await assertFails(getDoc(doc(parent(),'parent_profiles','kaien')));
    await assertSucceeds(getDoc(doc(parent('parent-1','kaien',301),'parent_profiles','kaien')));
    await env.withSecurityRulesDisabled(async c=>updateDoc(doc(c.firestore(),'parent_profiles','kaien'),{disabled:true}));
    await assertFails(getDoc(doc(parent('parent-1','kaien',301),'parent_profiles','kaien')));
  });
  it('supports first-device transactions without allowing ownership changes or grants',async()=>{
    const db=parent();const ref=doc(db,'devices','parent-1_browser');
    await assertSucceeds(runTransaction(db,async tx=>{
      await tx.get(ref);tx.set(ref,{id:'parent-1_browser',activation_code:'BEE-test',owner_user_id:'parent-1',owner_username:'kaien',parent_name:'0',child_name:'KaiEn',spelling_bee_enabled:false,ai_features_enabled:false,created_at:'now',last_seen_at:'now'});
    }));
    await assertSucceeds(updateDoc(ref,{last_seen_at:'later'}));
    await assertFails(updateDoc(ref,{spelling_bee_enabled:true}));
    await assertFails(updateDoc(ref,{owner_user_id:'parent-2'}));
  });
  it('runs concurrent token reloads and repeated approvals through the actual service',async()=>{
    const db=staff();
    vi.doMock('../src/lib/firebase',()=>({db,auth:{currentUser:{uid:'admin',email:'admin@lb.com'}}}));
    const service=await import('../src/services/firebaseDb');
    await Promise.all([service.addBeeTokens('kaien',10),service.addBeeTokens('kaien',20)]);
    expect((await getDoc(doc(db,'parent_profiles','kaien'))).data()?.bee_tokens).toBe(30);
    await env.withSecurityRulesDisabled(async c=>setDoc(doc(c.firestore(),'activation_requests','parent-1'),{user_id:'parent-1',status:'pending'}));
    const results=await Promise.allSettled([service.approveActivation('parent-1','kaien',true,false,10),service.approveActivation('parent-1','kaien',true,false,10)]);
    expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);
    expect((await getDoc(doc(db,'parent_profiles','kaien'))).data()?.bee_tokens).toBe(40);
  });
});
