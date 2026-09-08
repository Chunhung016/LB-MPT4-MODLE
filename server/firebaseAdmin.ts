import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import config from '../firebase-applet-config.json';
import workload from './firebase-workload-config.json';
import { Firestore } from '@google-cloud/firestore';
import { ExternalAccountClient } from 'google-auth-library';
import { getVercelOidcToken } from '@vercel/oidc';

let federatedDb: Firestore | undefined;

export function firebaseAdmin() {
  const projectId = process.env.FIREBASE_PROJECT_ID || config.projectId;
  const databaseId = process.env.FIREBASE_DATABASE_ID || config.firestoreDatabaseId;
  let app = getApps().find(app => app.name === 'little-bee-server');
  if (!app) {
    if (process.env.VERCEL === '1' && !process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const client = ExternalAccountClient.fromJSON({
        type: 'external_account',
        audience: `//iam.googleapis.com/projects/${workload.projectNumber}/locations/global/workloadIdentityPools/${workload.poolId}/providers/${workload.providerId}`,
        subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
        token_url: 'https://sts.googleapis.com/v1/token',
        service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${workload.serviceAccountEmail}:generateAccessToken`,
        subject_token_supplier: { getSubjectToken: () => getVercelOidcToken() },
      });
      if (!client) throw new Error('Unable to initialize Firebase workload identity.');
      app = initializeApp({ projectId, credential: { getAccessToken: async () => {
        const result = await client.getAccessToken();
        if (!result.token) throw new Error('Firebase workload identity returned no token.');
        return { access_token: result.token, expires_in: Math.max(1, Math.floor(((client.credentials.expiry_date ?? Date.now() + 300000) - Date.now()) / 1000)) };
      } } }, 'little-bee-server');
      federatedDb = new Firestore({ projectId, databaseId, authClient: client });
      return { auth: getAuth(app), db: federatedDb };
    }
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const serviceAccount = raw ? JSON.parse(raw) : null;
    if (serviceAccount && serviceAccount.project_id !== projectId) throw new Error('Firebase server credentials belong to a different project.');
    app = initializeApp({ projectId, credential: serviceAccount ? cert(serviceAccount) : applicationDefault() }, 'little-bee-server');
  }
  return { auth: getAuth(app), db: federatedDb ?? getFirestore(app, databaseId) };
}
