/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let app;
let db: any = null;
let auth: any = null;
let isFirebaseActive = false;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  recommendation: string;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: any,
  operationType: OperationType = OperationType.WRITE,
  path: string | null = null
): never {
  console.error("Firestore operation failed:", error);
  let recommendation = "Ocorreu um erro desconhecido ao processar os dados do concurso.";
  
  if (error && typeof error === 'object') {
    const code = error.code;
    if (code === 'permission-denied') {
      recommendation = "Acesso negado: Você não tem permissão para realizar esta operação ou sua sessão expirou.";
    } else if (code === 'unavailable') {
      recommendation = "O banco de dados está indisponível. Por favor, verifique a ligação à Internet em Moçambique.";
    } else if (code === 'quota-exceeded') {
      recommendation = "A cota gratuita do banco de dados foi temporariamente excedida. Tente novamente mais tarde.";
    } else if (code === 'unauthenticated') {
      recommendation = "Inicie sessão para obter autorização segura do júri ou administração.";
    }
  }

  const errorInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : (error?.message || String(error)),
    operationType,
    path,
    recommendation,
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((p: any) => ({
        providerId: p.providerId,
        email: p.email,
      })) || []
    }
  };
  
  throw new Error(JSON.stringify(errorInfo));
}

// Check if config keys are valid before booting
if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== '') {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
    auth = getAuth(app);
    isFirebaseActive = true;
    
    // Quick validation check as per guidelines
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn("Firebase detectado como offline. Usando fallback local.");
        }
      }
    };
    testConnection();
  } catch (error) {
    console.error("Erro ao inicializar serviços Firebase:", error);
  }
}

export { db, auth, isFirebaseActive };

