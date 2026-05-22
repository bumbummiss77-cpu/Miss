/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useContest } from '../context/ContestContext';
import { Crown, Eye, User, ShieldCheck, Sparkles, RefreshCw, LogOut } from 'lucide-react';
import { auth } from '../lib/firebase';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { 
    currentVoter, 
    switchUserRole, 
    clearAllState, 
    settings,
    isFirebaseConnected,
    loginWithGoogle,
    logoutUser
  } = useContest();
  const [showTesterMenu, setShowTesterMenu] = useState(false);

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'enrollment': return 'Fase 1: Inscrições Abertas';
      case 'selection': return 'Fase 2: Seleção de Candidatas';
      case 'public_voting': return 'Fase 3: Votação Pública';
      case 'jury_voting': return 'Fase 4: Avaliação de Jurados';
      case 'grand_final': return 'Fase 5: Grande Final ao Vivo';
      default: return 'Concurso Ativo';
    }
  };

  const menuItems = [
    { id: 'candidates', label: 'Candidatas' },
    { id: 'leaderboard', label: 'Classificação' },
    { id: 'register', label: 'Inscrição de Candidatas' },
    ...(currentVoter.role === 'admin' ? [{ id: 'admin', label: 'Organização (Admin)' }] : [])
  ];

  return (
    <header className="sticky top-0 z-40 bg-carbon-950/95 backdrop-blur-md border-b border-gold-500/25 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('candidates')}>
            <div className="relative p-2 bg-gradient-to-br from-gold-600 to-gold-400 rounded-lg shadow-md animate-pulse">
              <Crown className="w-6 h-6 text-carbon-950 font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg sm:text-xl font-semibold tracking-widest text-gold-400 uppercase">
                MISS MOÇAMBIQUE
              </span>
              <span className="font-tech text-2xs tracking-widest text-carbon-400 uppercase">
                {settings.contestEdition}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 rounded-lg font-sans text-sm tracking-wide transition-all duration-300 ${
                  activeTab === item.id
                    ? 'text-gold-400 bg-gold-950/20 border-b-2 border-gold-500 font-semibold'
                    : 'text-carbon-300 hover:text-gold-300 hover:bg-carbon-900/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Role Status and Simulation Selector */}
          <div className="flex items-center space-x-3">
            {/* Phase Badge */}
            <div className="hidden lg:flex items-center px-3 py-1.5 bg-carbon-900 border border-gold-500/20 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-ping" />
              <span className="font-sans text-2xs text-gold-200 tracking-wider uppercase font-medium">
                {getStageLabel(settings.activeStage)}
              </span>
            </div>

            {/* Simulated User Profile Switcher Button */}
            <div className="relative">
              <button
                id="btn-tester-menu"
                onClick={() => setShowTesterMenu(!showTesterMenu)}
                className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-carbon-900 to-carbon-800 border border-gold-500/40 hover:border-gold-400 rounded-lg transition-all text-left"
              >
                <div className={`p-1 rounded-sm ${
                  currentVoter.role === 'admin' ? 'bg-red-950 text-red-400' :
                  currentVoter.role === 'jury' ? 'bg-gold-950 text-gold-400' :
                  'bg-carbon-950 text-carbon-400'
                }`}>
                  {currentVoter.role === 'admin' ? <ShieldCheck className="w-4 h-4" /> :
                   currentVoter.role === 'jury' ? <Sparkles className="w-4 h-4" /> :
                   <User className="w-4 h-4" />}
                </div>
                <div className="hidden sm:block">
                  <p className="font-tech text-3xs text-carbon-400 leading-none">Perfil de Teste</p>
                  <p className="font-sans text-xs text-gold-300 font-medium truncate max-w-[120px]">
                    {currentVoter.username}
                  </p>
                </div>
              </button>

              {/* Simulation Quick Switch Menu */}
              {showTesterMenu && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-carbon-900 border border-gold-500/30 rounded-xl shadow-2xl p-4 z-50 text-carbon-200"
                  id="tester-dropdown"
                >
                  <p className="font-sans text-xs text-gold-400 font-semibold mb-3 tracking-widest uppercase">
                    SIMULAÇÃO DE FUNÇÃO
                  </p>
                  <p className="font-sans text-2xs text-carbon-400 mb-4 leading-relaxed">
                    Escolha uma identidade para navegar e validar as vistas exclusivas do público, jurados e administração.
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <button
                      id="role-public"
                      onClick={() => { switchUserRole('public'); setShowTesterMenu(false); setActiveTab('candidates'); }}
                      className={`w-full flex items-center space-x-3 p-2.5 rounded-lg text-left text-xs transition ${
                        currentVoter.role === 'public' ? 'bg-gold-900/20 border border-gold-500/50 text-gold-200' : 'hover:bg-carbon-800'
                      }`}
                    >
                      <User className="w-4 h-4 text-sky-400" />
                      <div>
                        <p className="font-semibold">Público Geral (Votante)</p>
                        <p className="text-3xs text-carbon-400">Pode pesquisar, votar grátis e comprar pacotes.</p>
                      </div>
                    </button>

                    <button
                      id="role-jury"
                      onClick={() => { switchUserRole('jury'); setShowTesterMenu(false); setActiveTab('candidates'); }}
                      className={`w-full flex items-center space-x-3 p-2.5 rounded-lg text-left text-xs transition ${
                        currentVoter.role === 'jury' ? 'bg-gold-900/20 border border-gold-500/50 text-gold-200' : 'hover:bg-carbon-800'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-gold-400" />
                      <div>
                        <p className="font-semibold">Maria Helena (Jurada)</p>
                        <p className="text-3xs text-carbon-400">Pode classificar candidatas com critérios oficiais.</p>
                      </div>
                    </button>

                    <button
                      id="role-admin"
                      onClick={() => { switchUserRole('admin'); setShowTesterMenu(false); setActiveTab('candidates'); }}
                      className={`w-full flex items-center space-x-3 p-2.5 rounded-lg text-left text-xs transition ${
                        currentVoter.role === 'admin' ? 'bg-gold-900/20 border border-gold-500/50 text-gold-200' : 'hover:bg-carbon-800'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="font-semibold">Organização (Admin)</p>
                        <p className="text-3xs text-carbon-400">Gere candidatas, relatórios, preços e auditoria.</p>
                      </div>
                    </button>
                  </div>

                  {/* Firebase Google Auth Connection Panel */}
                  {isFirebaseConnected && (
                    <div className="border-t border-carbon-800 pt-3 pb-2 px-1">
                      <p className="font-tech text-3xs text-gold-400 font-bold mb-1 uppercase tracking-widest">
                        Autenticação do Firebase
                      </p>
                      {auth?.currentUser && !auth.currentUser.isAnonymous ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-1.5 text-2xs text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[200px] font-medium">
                              {auth.currentUser.email}
                            </span>
                          </div>
                          <button
                            id="btn-google-signout"
                            onClick={async () => {
                              if (logoutUser) await logoutUser();
                              setShowTesterMenu(false);
                            }}
                            className="w-full py-1 bg-carbon-800 hover:bg-rose-950/20 text-rose-450 hover:text-rose-400 border border-carbon-700/50 rounded-md font-sans text-3xs transition-all flex items-center justify-center space-x-1"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Terminar Sessão Google</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          id="btn-google-signin"
                          onClick={async () => {
                            if (loginWithGoogle) await loginWithGoogle();
                            setShowTesterMenu(false);
                          }}
                          className="w-full py-2 bg-gradient-to-r from-gold-600 to-gold-400 font-sans text-xs text-carbon-950 font-bold rounded-lg flex items-center justify-center space-x-1 hover:shadow-md cursor-pointer transition-all"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Entrar com Google</span>
                        </button>
                      )}
                    </div>
                  )}

                  <div className="border-t border-carbon-800 pt-3 flex justify-between items-center">
                    <button
                      id="btn-restaurar-dados"
                      onClick={() => { clearAllState(); setShowTesterMenu(false); window.location.reload(); }}
                      className="flex items-center text-3xs text-rose-400 hover:text-rose-300 transition"
                    >
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin-hover" />
                      Restaurar Dados Padrão
                    </button>
                    <span className="font-mono text-3xs text-carbon-500">MZN Active</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      
      {/* Mobile Nav Header */}
      <div className="md:hidden flex overflow-x-auto border-t border-gold-500/10 bg-carbon-900/60 scrollbar-none px-4 py-2 space-x-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-sans tracking-wide transition ${
              activeTab === item.id
                ? 'bg-gold-500 text-carbon-950 font-medium shadow-sm shadow-gold-500/20'
                : 'text-carbon-300 hover:text-gold-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
