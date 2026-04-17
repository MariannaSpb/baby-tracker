import { initializeApp } from 'firebase-admin/app';
import { credential } from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Local dev: GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json
// Cloud Run: uses the attached service account automatically (ADC)
initializeApp({
  credential: credential.applicationDefault(),
  projectId: process.env['FIRESTORE_PROJECT_ID'],
});

export const db = getFirestore();
