import { describe, it, expect, vi } from 'vitest';
import { authenticatedRequest } from '../src/lib/authenticatedRequest';
import { parentEmail, tokenAmount } from '../src/lib/accountValidation';
import { createAccountsHandler } from '../server/accounts';

describe('Firebase token lifecycle', () => {
  it('refreshes once on an expired token then sends the new token', async () => {
    const user = { getIdToken: vi.fn().mockResolvedValueOnce('expired').mockResolvedValueOnce('fresh') };
    const send = vi.fn().mockResolvedValueOnce(new Response('{}', {status: 401})).mockResolvedValueOnce(Response.json({success:true}));
    await authenticatedRequest(user, '/api/accounts', {action:'create'}, send);
    expect(user.getIdToken.mock.calls).toEqual([[false],[true]]);
    expect(send.mock.calls[1][1].headers.Authorization).toBe('Bearer fresh');
  });
  it('stops after two authentication rejections', async () => {
    const user = { getIdToken: vi.fn().mockResolvedValue('bad') };
    const send = vi.fn().mockImplementation(() => Promise.resolve(Response.json({error:'Sign in again'}, {status:401})));
    await expect(authenticatedRequest(user,'/api/accounts',{},send)).rejects.toThrow('Sign in again');
    expect(send).toHaveBeenCalledTimes(2);
  });
  it.each([403,409,500,503])('does not repeat a mutation after HTTP %s', async status => {
    const send = vi.fn().mockResolvedValue(Response.json({error:'failed'}, {status}));
    await expect(authenticatedRequest({getIdToken:async ()=>'token'}, '/api/accounts',{},send)).rejects.toThrow('failed');
    expect(send).toHaveBeenCalledTimes(1);
  });
  it('rejects forged local sessions and non-JSON SPA fallbacks', async () => {
    const send = vi.fn();
    await expect(authenticatedRequest(null,'/api/accounts',{},send)).rejects.toThrow('sign in');
    expect(send).not.toHaveBeenCalled();
    send.mockResolvedValue(new Response('<html></html>'));
    await expect(authenticatedRequest({getIdToken:async ()=>'token'},'/api/accounts',{},send)).rejects.toThrow('invalid response');
  });
});
describe('Account validation', () => {
  it('normalizes case without silently merging different usernames', () => {
    expect(parentEmail(' KaiEn ')).toBe('kaien@parents.littlebee.app');
    expect(()=>parentEmail('kai/en')).toThrow();
    expect(()=>parentEmail('kai en')).toThrow();
  });
  it.each(['',null,undefined,-1,1.5,'10oops',Infinity,1000001])('rejects invalid tokens %s', amount => {
    expect(()=>tokenAmount(amount)).toThrow();
  });
  it('preserves zero and rejects zero for reloads', () => {
    expect(tokenAmount('0')).toBe(0);
    expect(()=>tokenAmount(0,false)).toThrow();
  });
});
describe('Account API authorization', () => {
  function response() {
    const res = {setHeader:vi.fn(),status:vi.fn(),json:vi.fn()}; res.status.mockReturnValue(res); res.json.mockReturnValue(res); return res;
  }
  it('rejects absent authorization before initializing services', async () => {
    const services=vi.fn(); const res=response();
    await createAccountsHandler(services)({method:'POST',headers:{},body:{action:'delete'}} as any,res as any);
    expect(res.status).toHaveBeenCalledWith(401); expect(services).not.toHaveBeenCalled();
  });
  it('checks token revocation and rejects invalid tokens before Firestore access', async () => {
    const auth={verifyIdToken:vi.fn().mockRejectedValue({code:'auth/id-token-revoked'})}; const db={collection:vi.fn()}; const res=response();
    await createAccountsHandler(()=>({auth,db}) as any)({method:'POST',headers:{authorization:'Bearer invalid'},body:{action:'delete'}} as any,res as any);
    expect(auth.verifyIdToken).toHaveBeenCalledWith('invalid',true); expect(db.collection).not.toHaveBeenCalled(); expect(res.status).toHaveBeenCalledWith(401);
  });
  it.each([{active:false,user_id:'admin',role:'admin'}, {active:true,user_id:'other',role:'admin'}, {active:true,user_id:'admin',role:'parent'}])('rejects unapproved staff %s', staff => {
    const auth={verifyIdToken:vi.fn().mockResolvedValue({email:'admin@lb.com',uid:'admin'}),createUser:vi.fn()};
    const db={collection:()=>({doc:()=>({get:async()=>({data:()=>staff})})})}; const res=response();
    return createAccountsHandler(()=>({auth,db}) as any)({method:'POST',headers:{authorization:'Bearer valid'},body:{action:'create'}} as any,res as any).then(()=>{
      expect(res.status).toHaveBeenCalledWith(403); expect(auth.createUser).not.toHaveBeenCalled();
    });
  });
});
