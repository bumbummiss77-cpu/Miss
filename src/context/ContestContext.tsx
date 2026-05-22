/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Candidate, Voter, SystemSettings, JuryEvaluation, VoteTransaction, AuditLog } from '../types';
import { 
  INITIAL_CANDIDATES, 
  INITIAL_SETTINGS, 
  INITIAL_VOTER, 
  INITIAL_JURY, 
  INITIAL_ADMIN, 
  INITIAL_EVALUATIONS, 
  INITIAL_TRANSACTIONS 
} from '../data/mockData';
import { isFirebaseActive, db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  signInAnonymously, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';

interface ContestContextType {
  candidates: Candidate[];
  settings: SystemSettings;
  currentVoter: Voter;
  evaluations: JuryEvaluation[];
  transactions: VoteTransaction[];
  auditLogs: AuditLog[];
  isFirebaseConnected: boolean;
  
  // Actions
  addCandidate: (candidateData: Omit<Candidate, 'id' | 'createdAt' | 'votesCount' | 'viewsCount' | 'juryScore' | 'active' | 'dailyVotesChange'>) => void;
  approveCandidate: (id: string) => void;
  rejectCandidate: (id: string) => void;
  voteCandidate: (
    candidateId: string, 
    votesQty: number, 
    method: 'mpesa' | 'emola' | 'mkesh' | 'visa', 
    phoneOrCard: string,
    voterName: string,
    voterEmail: string
  ) => Promise<boolean>;
  submitJuryEvaluation: (evaluation: Omit<JuryEvaluation, 'id' | 'createdAt' | 'juryId' | 'juryName'>) => void;
  updateSettings: (newSettings: SystemSettings) => void;
  switchUserRole: (role: 'public' | 'jury' | 'admin') => void;
  incrementCandidateViews: (id: string) => void;
  clearAllState: () => void;
  loginWithGoogle?: () => Promise<any>;
  logoutUser?: () => Promise<void>;
}

const ContestContext = createContext<ContestContextType | undefined>(undefined);

export const ContestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from LocalStorage or Fallbacks
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem('mos_candidates');
    return saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('mos_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [currentVoter, setCurrentVoter] = useState<Voter>(() => {
    const saved = localStorage.getItem('mos_current_voter');
    return saved ? JSON.parse(saved) : INITIAL_VOTER;
  });

  const [evaluations, setEvaluations] = useState<JuryEvaluation[]>(() => {
    const saved = localStorage.getItem('mos_evaluations');
    return saved ? JSON.parse(saved) : INITIAL_EVALUATIONS;
  });

  const [transactions, setTransactions] = useState<VoteTransaction[]>(() => {
    const saved = localStorage.getItem('mos_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('mos_audit_logs');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'log-init',
        userId: 'system',
        userName: 'Sistema Miss',
        action: 'INICIALIZAÇÃO',
        details: 'Plataforma oficial inicializada com sucesso na Edição de 2026',
        ipAddress: '127.0.0.1',
        createdAt: new Date().toISOString()
      }
    ];
  });

  // Keep LocalStorage in sync for offline resilience
  useEffect(() => {
    localStorage.setItem('mos_candidates', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('mos_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('mos_current_voter', JSON.stringify(currentVoter));
  }, [currentVoter]);

  useEffect(() => {
    localStorage.setItem('mos_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem('mos_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('mos_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Sincronização e autenticação do Firebase com escopo de regras de segurança
  useEffect(() => {
    if (isFirebaseActive && db && auth) {
      let isInitialRun = true;
      
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log("Firebase Auth State Changed:", user?.uid, "Email:", user?.email, "IsAnonymous:", user?.isAnonymous);
        
        if (!user && isInitialRun) {
          isInitialRun = false;
          try {
            await signInAnonymously(auth);
          } catch (err: any) {
            if (err?.code === 'auth/admin-restricted-operation' || 
                err?.message?.includes('admin-restricted-operation')) {
              console.warn("Autenticação anónima está desativada no Firebase Console. Prosseguindo como observador público guest.");
            } else {
              console.error("Erro ao autenticar anonimamente:", err);
            }
            // Sincronizar dados públicos mesmo que a autenticação anónima esteja desativada/restrita
            await syncUserData(null);
          }
          return;
        }

        if (user) {
          // Sync data based on this user's privileges
          await syncUserData(user);
        } else {
          // Sincronizar dados públicos para utilizador não autenticado
          await syncUserData(null);
        }
      });

      return unsubscribe;
    }
  }, [isFirebaseActive]);

  const syncUserData = async (user: any) => {
    if (!db) return;
    try {
      const userEmail = user?.email || '';
      const isUserAdmin = userEmail === 'lourendzaurbay@gmail.com' || userEmail.endsWith('@missmoçambique.co.mz') || currentVoter.role === 'admin';
      const isUserJury = userEmail.endsWith('@jurado.org.mz') || currentVoter.role === 'jury';

      console.log("Sincronizando dados com privilégios:", { isUserAdmin, isUserJury, email: userEmail });

      // 1. Settings (readable by anyone)
      try {
        const settingsDocRef = doc(db, 'settings', 'global');
        const settingsDoc = await getDoc(settingsDocRef);
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data() as SystemSettings);
        } else if (isUserAdmin || userEmail === 'lourendzaurbay@gmail.com') {
          await setDoc(settingsDocRef, INITIAL_SETTINGS);
          setSettings(INITIAL_SETTINGS);
        }
      } catch (err) {
        console.warn("Falta de permissão para ler/configurar definições globais.", err);
      }

      // 2. Candidates
      try {
        let candQuery;
        if (isUserAdmin || userEmail === 'lourendzaurbay@gmail.com') {
          candQuery = query(collection(db, 'candidates'));
        } else {
          // Rule boundary: only query approved candidates
          candQuery = query(collection(db, 'candidates'), where('status', '==', 'approved'));
        }
        
        const candSnap = await getDocs(candQuery);
        if (!candSnap.empty) {
          const dbCandidates: Candidate[] = [];
          candSnap.forEach((doc) => {
            dbCandidates.push(doc.data() as Candidate);
          });
          setCandidates(dbCandidates);
        } else if (isUserAdmin || userEmail === 'lourendzaurbay@gmail.com') {
          // Seed initial candidates if empty and is Admin
          for (const cand of INITIAL_CANDIDATES) {
            await setDoc(doc(db, 'candidates', cand.id), cand);
          }
          setCandidates(INITIAL_CANDIDATES);
        }
      } catch (err) {
        console.warn("Sem permissão para ler coleção de candidatas sob filtros.", err);
      }

      // 3. Evaluations (Readable by Jurors and Admins)
      if (isUserAdmin || isUserJury || userEmail === 'lourendzaurbay@gmail.com') {
        try {
          const evalSnap = await getDocs(collection(db, 'evaluations'));
          const dbEvals: JuryEvaluation[] = [];
          evalSnap.forEach((doc) => {
            dbEvals.push(doc.data() as JuryEvaluation);
          });
          setEvaluations(dbEvals);
        } catch (err) {
          console.warn("Apenas júris ou admins podem listar as classificações.", err);
        }
      } else {
        // Clear evaluations for public observers
        setEvaluations([]);
      }

      // 4. Transactions (Admin matches all; logged-in can filter their own)
      try {
        let txQuery;
        if (isUserAdmin || userEmail === 'lourendzaurbay@gmail.com') {
          txQuery = query(collection(db, 'transactions'));
        } else if (userEmail) {
          txQuery = query(collection(db, 'transactions'), where('voterEmail', '==', userEmail));
        } else {
          txQuery = null;
        }

        if (txQuery) {
          const txSnap = await getDocs(txQuery);
          const dbTxs: VoteTransaction[] = [];
          txSnap.forEach((doc) => {
            dbTxs.push(doc.data() as VoteTransaction);
          });
          setTransactions(dbTxs);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.warn("Permissões de transação restritas ou inexistentes.", err);
      }

      // 5. Audit Logs (Only admins can read)
      if (isUserAdmin || userEmail === 'lourendzaurbay@gmail.com') {
        try {
          const logSnap = await getDocs(collection(db, 'auditLogs'));
          const dbLogs: AuditLog[] = [];
          logSnap.forEach((doc) => {
            dbLogs.push(doc.data() as AuditLog);
          });
          setAuditLogs(dbLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (err) {
          console.warn("Bloqueio de leitura de auditoria por regras de segurança.", err);
        }
      } else {
        setAuditLogs([]);
      }

    } catch (overallErr) {
      console.error("Erro na sincronização:", overallErr);
    }
  };

  // Logging function
  const logAction = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: auth?.currentUser?.uid || currentVoter.id,
      userName: currentVoter.username,
      action,
      details,
      ipAddress: '197.249.0.125', // Simulated Mozambican ISP address
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);

    if (isFirebaseActive && db) {
      setDoc(doc(db, 'auditLogs', newLog.id), newLog).catch(err => {
        console.error("Erro ao registrar log de auditoria no Firebase:", err);
      });
    }
  };

  // Add Candidate (Inscrição)
  const addCandidate = async (candidateData: Omit<Candidate, 'id' | 'createdAt' | 'votesCount' | 'viewsCount' | 'juryScore' | 'active' | 'dailyVotesChange'>) => {
    const newCandidate: Candidate = {
      ...candidateData,
      id: `cand-${Date.now()}`,
      createdAt: new Date().toISOString(),
      votesCount: 0,
      viewsCount: 0,
      juryScore: 0,
      active: true,
      dailyVotesChange: 0
    };

    if (isFirebaseActive && db) {
      try {
        await setDoc(doc(db, 'candidates', newCandidate.id), newCandidate);
      } catch (error) {
        handleFirestoreError(error);
      }
    }

    setCandidates(prev => [newCandidate, ...prev]);
    logAction('INSCRIÇÃO CANDIDATA', `Nova Inscrição registada de ${newCandidate.fullName} (${newCandidate.province})`);
  };

  // Approve Candidate (Admin)
  const approveCandidate = async (id: string) => {
    if (isFirebaseActive && db) {
      try {
        await updateDoc(doc(db, 'candidates', id), { status: 'approved' });
      } catch (error) {
        handleFirestoreError(error);
      }
    }

    setCandidates(prev => prev.map(c => {
      if (c.id === id) {
        logAction('APROVAÇÃO INSCRIÇÃO', `Inscrição da candidata ${c.fullName} aprovada com sucesso.`);
        return { ...c, status: 'approved' };
      }
      return c;
    }));
  };

  // Reject Candidate (Admin)
  const rejectCandidate = async (id: string) => {
    if (isFirebaseActive && db) {
      try {
        await updateDoc(doc(db, 'candidates', id), { status: 'rejected' });
      } catch (error) {
        handleFirestoreError(error);
      }
    }

    setCandidates(prev => prev.map(c => {
      if (c.id === id) {
        logAction('REJEIÇÃO INSCRIÇÃO', `Inscrição da candidata ${c.fullName} rejeitada pela administração.`);
        return { ...c, status: 'rejected' };
      }
      return c;
    }));
  };

  // Increment view counts (Views)
  const incrementCandidateViews = async (id: string) => {
    const candidate = candidates.find(c => c.id === id);
    if (!candidate) return;

    if (isFirebaseActive && db) {
      try {
        await updateDoc(doc(db, 'candidates', id), { viewsCount: candidate.viewsCount + 1 });
      } catch (error) {
        console.error("Erro ao incrementar views no Firebase:", error);
      }
    }

    setCandidates(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, viewsCount: c.viewsCount + 1 };
      }
      return c;
    }));
  };

  // Vote for a candidate (Simulating Instant Mozambican USSD / Visa payment)
  const voteCandidate = async (
    candidateId: string, 
    votesQty: number, 
    method: 'mpesa' | 'emola' | 'mkesh' | 'visa', 
    phoneOrCard: string,
    voterName: string,
    voterEmail: string
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const candidate = candidates.find(c => c.id === candidateId);
        if (!candidate) {
          resolve(false);
          return;
        }

        const isPaid = votesQty > 1;
        const totalCost = isPaid ? votesQty * settings.paidVotePriceMZN : 0;

        const newTx: VoteTransaction = {
          id: `tx-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          candidateId,
          candidateName: candidate.stageName,
          voterName: voterName || currentVoter.username,
          voterEmail: voterEmail || currentVoter.email,
          votesQuantity: votesQty,
          paymentMethod: method,
          phoneNumber: ['mpesa', 'emola', 'mkesh'].includes(method) ? phoneOrCard : undefined,
          amountMZN: totalCost,
          status: 'completed',
          createdAt: new Date().toISOString()
        };

        if (isFirebaseActive && db) {
          try {
            await setDoc(doc(db, 'transactions', newTx.id), newTx);
            await updateDoc(doc(db, 'candidates', candidateId), {
              votesCount: candidate.votesCount + votesQty
            });
          } catch (error) {
            console.error("Erro no fluxo do Firebase para votar:", error);
            handleFirestoreError(error);
          }
        }

        setTransactions(prev => [newTx, ...prev]);

        setCandidates(prev => prev.map(c => {
          if (c.id === candidateId) {
            return { ...c, votesCount: c.votesCount + votesQty };
          }
          return c;
        }));

        if (!isPaid) {
          setCurrentVoter(prev => ({
            ...prev,
            freeVoteAvailable: false,
            lastVotedAt: new Date().toISOString()
          }));
        }

        logAction('REGISTO DE VOTOS', `Voto de ${votesQty} unidades registado para ${candidate.stageName} via de pagamento ${method.toUpperCase()}`);
        resolve(true);
      }, 1500);
    });
  };

  // Submit Jury Evaluation (Jury Panel)
  const submitJuryEvaluation = async (evaluation: Omit<JuryEvaluation, 'id' | 'createdAt' | 'juryId' | 'juryName'>) => {
    const newEval: JuryEvaluation = {
      ...evaluation,
      id: `eval-${Date.now()}`,
      juryId: auth?.currentUser?.uid || currentVoter.id,
      juryName: currentVoter.username,
      createdAt: new Date().toISOString()
    };

    // Recalculate Candidate Jury Average Score
    const targetCandidateEvals = [...evaluations, newEval].filter(ev => ev.candidateId === evaluation.candidateId);
    const sum = targetCandidateEvals.reduce((acc, ev) => {
      const avg = (ev.communication + ev.presence + ev.confidence + ev.runway + ev.talent) / 5;
      return acc + avg;
    }, 0);
    const totalAvg = parseFloat((sum / targetCandidateEvals.length).toFixed(2));

    if (isFirebaseActive && db) {
      try {
        await setDoc(doc(db, 'evaluations', newEval.id), newEval);
        await updateDoc(doc(db, 'candidates', evaluation.candidateId), {
          juryScore: totalAvg
        });
      } catch (error) {
        handleFirestoreError(error);
      }
    }

    setEvaluations(prev => [newEval, ...prev]);

    setCandidates(prev => prev.map(c => {
      if (c.id === evaluation.candidateId) {
        return { ...c, juryScore: totalAvg };
      }
      return c;
    }));

    logAction('AVALIAÇÃO JURADO', `Jurada ${currentVoter.username} atribuiu nota para candidata ${candidates.find(cand => cand.id === evaluation.candidateId)?.stageName}`);
  };

  // Update Settings (Admin Panel)
  const updateSettings = async (newSettings: SystemSettings) => {
    if (isFirebaseActive && db) {
      try {
        await setDoc(doc(db, 'settings', 'global'), newSettings);
      } catch (error) {
        handleFirestoreError(error);
      }
    }

    setSettings(newSettings);
    logAction('AJUSTE CONFIGURAÇÕES', 'Configurações de pesos e fases do concurso atualizados pela administração');
  };

  // Dual switch roles for quick simulation testing
  const switchUserRole = async (role: 'public' | 'jury' | 'admin') => {
    let selectedVoter: Voter = INITIAL_VOTER;
    if (role === 'jury') {
      selectedVoter = INITIAL_JURY;
    } else if (role === 'admin') {
      selectedVoter = INITIAL_ADMIN;
    }
    setCurrentVoter(selectedVoter);
    logAction('TROCA DE FUNÇÃO', `Sessão do utilizador alterada para vista de ${role.toUpperCase()} (${selectedVoter.username})`);

    // In a Firebase active environment, if we already have the Google admin logged in,
    // we can write the jury or admin lookup document for this user to test active permissions.
    if (isFirebaseActive && db && auth?.currentUser) {
      const user = auth.currentUser;
      if (!user.isAnonymous) {
        const userEmail = user.email || '';
        const isUserAdmin = userEmail === 'lourendzaurbay@gmail.com' || userEmail.endsWith('@missmoçambique.co.mz');
        if (isUserAdmin) {
          try {
            if (role === 'admin') {
              await setDoc(doc(db, 'admins', user.uid), {
                uid: user.uid,
                email: userEmail,
                role: 'admin',
                updatedAt: new Date().toISOString()
              });
            } else if (role === 'jury') {
              await setDoc(doc(db, 'juries', user.uid), {
                uid: user.uid,
                email: userEmail,
                role: 'jury',
                updatedAt: new Date().toISOString()
              });
            }
          } catch (e) {
            console.error("Erro ao registrar papel do utilizador no Firestore:", e);
          }
        }
      }
    }
  };

  // Google Sign-In secure authentication flow
  const loginWithGoogle = async () => {
    if (isFirebaseActive && auth) {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userEmail = user.email || '';
        const isUserAdmin = userEmail === 'lourendzaurbay@gmail.com' || userEmail.endsWith('@missmoçambique.co.mz');
        const isUserJury = userEmail.endsWith('@jurado.org.mz');

        const newVoter: Voter = {
          id: user.uid,
          username: user.displayName || userEmail.split('@')[0],
          email: userEmail,
          role: isUserAdmin ? 'admin' : (isUserJury ? 'jury' : 'public'),
          freeVoteAvailable: currentVoter.freeVoteAvailable,
          lastVotedAt: currentVoter.lastVotedAt
        };
        
        setCurrentVoter(newVoter);
        logAction('LOGIN_GOOGLE', `Utilizador ${user.displayName} (${userEmail}) autenticado via Google.`);

        if (isUserAdmin) {
          try {
            await setDoc(doc(db, 'admins', user.uid), {
              uid: user.uid,
              email: userEmail,
              role: 'admin',
              updatedAt: new Date().toISOString()
            });
            console.log("Admin lookup created under secure firebase rules.");
          } catch (adminErr) {
            console.error("Erro ao registrar admin de consulta:", adminErr);
          }
        }
        
        return user;
      } catch (error) {
        console.error("Erro no login com Google:", error);
        handleFirestoreError(error);
      }
    }
  };

  const logoutUser = async () => {
    if (isFirebaseActive && auth) {
      try {
        await signOut(auth);
        try {
          await signInAnonymously(auth);
        } catch (anonErr: any) {
          if (anonErr?.code === 'auth/admin-restricted-operation' || 
              anonErr?.message?.includes('admin-restricted-operation')) {
            console.warn("Autenticação anónima desativada no Firebase Console. Prosseguindo como convidado sem sessão ativa.");
          } else {
            console.error("Erro ao autenticar anonimamente após logoff:", anonErr);
          }
        }
        
        const resetVoter: Voter = INITIAL_VOTER;
        setCurrentVoter(resetVoter);
        logAction('LOGOUT_GOOGLE', `Sessão do utilizador terminada com sucesso.`);
      } catch (error) {
        console.error("Erro no logoff:", error);
      }
    }
  };

  // Clear system back to factory defaults
  const clearAllState = async () => {
    localStorage.removeItem('mos_candidates');
    localStorage.removeItem('mos_settings');
    localStorage.removeItem('mos_current_voter');
    localStorage.removeItem('mos_evaluations');
    localStorage.removeItem('mos_transactions');
    localStorage.removeItem('mos_audit_logs');
    
    if (isFirebaseActive && db) {
      try {
        await setDoc(doc(db, 'settings', 'global'), INITIAL_SETTINGS);
        
        const candSnap = await getDocs(collection(db, 'candidates'));
        for (const docObj of candSnap.docs) {
          await deleteDoc(docObj.ref);
        }
        for (const cand of INITIAL_CANDIDATES) {
          await setDoc(doc(db, 'candidates', cand.id), cand);
        }

        const evSnap = await getDocs(collection(db, 'evaluations'));
        for (const docObj of evSnap.docs) {
          await deleteDoc(docObj.ref);
        }
        for (const ev of INITIAL_EVALUATIONS) {
          await setDoc(doc(db, 'evaluations', ev.id), ev);
        }

        const txSnap = await getDocs(collection(db, 'transactions'));
        for (const docObj of txSnap.docs) {
          await deleteDoc(docObj.ref);
        }
        for (const tx of INITIAL_TRANSACTIONS) {
          await setDoc(doc(db, 'transactions', tx.id), tx);
        }

        const logSnap = await getDocs(collection(db, 'auditLogs'));
        for (const docObj of logSnap.docs) {
          await deleteDoc(docObj.ref);
        }
      } catch (error) {
        console.error("Erro ao limpar Firebase:", error);
      }
    }

    setCandidates(INITIAL_CANDIDATES);
    setSettings(INITIAL_SETTINGS);
    setCurrentVoter(INITIAL_VOTER);
    setEvaluations(INITIAL_EVALUATIONS);
    setTransactions(INITIAL_TRANSACTIONS);
    
    setAuditLogs([
      {
        id: 'log-reset',
        userId: 'system',
        userName: 'Sistema Miss',
        action: 'RESTAURAR SÉRIE',
        details: 'Plataforma oficial redefinida para os valores padrão de fábrica com sucesso.',
        ipAddress: '127.0.0.1',
        createdAt: new Date().toISOString()
      }
    ]);
  };

  return (
    <ContestContext.Provider value={{
      candidates,
      settings,
      currentVoter,
      evaluations,
      transactions,
      auditLogs,
      isFirebaseConnected: isFirebaseActive,
      
      addCandidate,
      approveCandidate,
      rejectCandidate,
      voteCandidate,
      submitJuryEvaluation,
      updateSettings,
      switchUserRole,
      incrementCandidateViews,
      clearAllState,
      loginWithGoogle,
      logoutUser
    }}>
      {children}
    </ContestContext.Provider>
  );
};

export const useContest = () => {
  const context = useContext(ContestContext);
  if (context === undefined) {
    throw new Error('useContest deve ser usado dentro de um ContestProvider');
  }
  return context;
};
