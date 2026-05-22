/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ContestProvider, useContest } from './context/ContestContext';
import { Header } from './components/Header';
import { CandidateCard } from './components/CandidateCard';
import { CandidateModal } from './components/CandidateModal';
import { Leaderboard } from './components/Leaderboard';
import { RegistrationForm } from './components/RegistrationForm';
import { AdminPanel } from './components/AdminPanel';
import { CONTEST_CATEGORIES, MOZAMBIQUE_PROVINCES } from './data/mockData';
import { Search, Filter, Sparkles, HelpCircle, ArrowUpDown, Award, Crown } from 'lucide-react';

// High-Fashion Quotes for the Premium Banner
const EDITORIAL_QUOTES = [
  "“A herança cultural, a graça majestosa e o intelecto brilhante — unindo Moçambique no palco do mundo.”",
  "“Empoderando jovens líderes em cada província costeira de Cabo Delgado ao Maputo.”",
  "“A beleza que restaura, conscientiza e transforma comunidades moçambicanas.”"
];

const MainAppContent: React.FC = () => {
  const { candidates, currentVoter, settings } = useContest();
  const [activeTab, setActiveTab] = useState<string>('candidates');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  // Active Explorer state filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'votes' | 'jury' | 'newest'>('votes');

  // Dynamic Quote Index helper
  const quoteIndex = Math.floor(Math.abs(candidates.length) % EDITORIAL_QUOTES.length);

  // Filter & sort candidates
  const filteredCandidates = candidates
    .filter(c => c.status === 'approved') // Only show approved candidates to the public
    .filter(c => {
      const matchesSearch = c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.stageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.biography.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProvince = selectedProvince === 'all' || c.province === selectedProvince;
      const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
      return matchesSearch && matchesProvince && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'votes') return b.votesCount - a.votesCount;
      if (sortBy === 'jury') return b.juryScore - a.juryScore;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div id="beauty-pageant-app" className="min-h-screen bg-carbon-950 text-carbon-100 flex flex-col selection:bg-gold-500 selection:text-carbon-950 font-sans tracking-wide">
      
      {/* Platform Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Primary Body Wrapper */}
      <main className="flex-grow">
        
        {/* TAB 1: VISUAL PORTFOLIO CABINETS & EXPLORER */}
        {activeTab === 'candidates' && (
          <div className="space-y-8 pb-16 animate-fadeIn">
            
            {/* HERO BANNER SECTION (Editorial Style) */}
            <section 
              id="editorial-home-banner"
              className="relative py-16 sm:py-24 bg-gradient-to-r from-carbon-950 via-carbon-900 to-carbon-950 border-b border-gold-500/10 text-center flex flex-col items-center overflow-hidden"
            >
              {/* Shimmer Ambient Glow background decoration */}
              <div className="absolute inset-0 royal-gradient-animate opacity-[0.03] pointer-events-none" />
              
              <div className="max-w-4xl mx-auto px-4 space-y-4 sm:space-y-6 relative z-10">
                <span className="flex items-center justify-center text-4xs tracking-widest text-gold-400 uppercase font-tech font-bold">
                  <Sparkles className="w-4 h-4 text-gold-500 mr-1.5 animate-pulse" />
                  Galeria de Portfólios Oficiais
                </span>
                
                <h2 className="font-display text-4xl sm:text-6xl text-gold-200 font-extrabold tracking-tight leading-none text-balance">
                  Beleza que Inspira e Transforma
                </h2>
                
                <p className="font-sans text-sm sm:text-lg text-carbon-350 max-w-2xl mx-auto italic font-light font-sans max-w-xl">
                  {EDITORIAL_QUOTES[quoteIndex]}
                </p>
                
                {/* Minimal metrics panel in banner */}
                <div className="flex justify-center space-x-6 pt-4 text-3xs font-tech tracking-wider uppercase text-carbon-450">
                  <span>Edição: <b className="text-gold-300">Miss Moçambique 2026</b></span>
                  <span>•</span>
                  <span>Categorias Ativas: <b className="text-gold-300">3 Modalidades</b></span>
                </div>
              </div>
            </section>

            {/* FILTERING CONTROLS CARD BOARD */}
            <section id="explorer-bar" className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="bg-carbon-900 border border-gold-500/5 p-4 rounded-2xl shadow-xl flex flex-col lg:flex-row gap-4 justify-between items-center text-xs">
                
                {/* Search Bar */}
                <div className="relative w-full lg:max-w-sm">
                  <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-carbon-500" />
                  <input
                    type="text"
                    id="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar candidata, causas ou talentos..."
                    className="w-full pl-10 pr-4 py-2 bg-carbon-950 border border-carbon-800 rounded-xl text-xs placeholder-carbon-600 focus:outline-none focus:ring-1 focus:ring-gold-500 text-gold-100"
                  />
                </div>

                {/* Filters Array */}
                <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
                  
                  {/* Category select dropdown */}
                  <div className="flex items-center space-x-1.5 w-full sm:w-auto flex-grow sm:flex-grow-0">
                    <Filter className="w-3.5 h-3.5 text-gold-450" />
                    <select
                      id="filter-category-select"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full sm:w-48 px-3 py-1.5 bg-carbon-950 border border-carbon-800 rounded-xl rounded-l-none text-xs text-carbon-300"
                    >
                      <option value="all">Todas Categorias</option>
                      {CONTEST_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat.replace(' Moçambique', '')}</option>
                      ))}
                    </select>
                  </div>

                  {/* Province select dropdown */}
                  <div className="flex items-center space-x-1.5 w-full sm:w-auto flex-grow sm:flex-grow-0">
                    <select
                      id="filter-province-select"
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="w-full sm:w-44 px-3 py-1.5 bg-carbon-950 border border-carbon-800 rounded-xl text-xs text-carbon-300"
                    >
                      <option value="all">Todas Províncias</option>
                      {MOZAMBIQUE_PROVINCES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sorting select dropdown */}
                  <div className="flex items-center space-x-1.5 w-full sm:w-auto flex-grow sm:flex-grow-0">
                    <ArrowUpDown className="w-3.5 h-3.5 text-gold-450" />
                    <select
                      id="sort-by-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full sm:w-44 px-3 py-1.5 bg-carbon-950 border border-carbon-800 rounded-xl text-xs text-carbon-300 font-medium"
                    >
                      <option value="votes">Mais Popular (Votos)</option>
                      <option value="jury">Top Notas Jurados</option>
                      <option value="newest">Novas Candidaturas</option>
                    </select>
                  </div>

                </div>
              </div>
            </section>

            {/* PORTRAITS COLLECTION GRID */}
            <section id="candidates-grid" className="max-w-7xl mx-auto px-4 sm:px-6">
              
              {/* Counter details bar */}
              <div className="flex justify-between items-center text-3xs font-tech tracking-wider uppercase text-carbon-500 mb-6 px-1">
                <span>Total de resultados: <b>{filteredCandidates.length} candidatas</b></span>
                <span>Filtro activo: <b>{selectedProvince === 'all' ? 'Nacional' : selectedProvince}</b></span>
              </div>

              {filteredCandidates.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-carbon-800 rounded-3xl" id="no-results-box">
                  <Crown className="w-10 h-10 text-carbon-700 mx-auto mb-3" />
                  <p className="text-xs text-carbon-400">Nenhum portfólio oficial correspondente aos critérios de busca ativos.</p>
                  <p className="text-4xs text-carbon-500 mt-1 uppercase font-tech tracking-widest">Tente alterar os termos de província ou categoria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCandidates.map((cand) => (
                    <CandidateCard 
                      key={cand.id} 
                      candidate={cand} 
                      onSelect={() => setSelectedCandidateId(cand.id)} 
                    />
                  ))}
                </div>
              )}
            </section>

          </div>
        )}

        {/* TAB 2: LIVE LEADERBOARD COMPONENT */}
        {activeTab === 'leaderboard' && (
          <Leaderboard />
        )}

        {/* TAB 3: REGISTRATION AGENCY ENROLLMENT SIGN-UP FORM */}
        {activeTab === 'register' && (
          <RegistrationForm />
        )}

        {/* TAB 4: PRIVATE ORGANIZATION DASHBOARD - For Admins Only */}
        {activeTab === 'admin' && currentVoter.role === 'admin' && (
          <AdminPanel />
        )}

      </main>

      {/* PORTFOLIO CLOSE-UP INTERACTIVE MODAL DETAILED OVERLAY */}
      {selectedCandidateId && (
        <CandidateModal 
          candidateId={selectedCandidateId} 
          onClose={() => setSelectedCandidateId(null)} 
        />
      )}

      {/* Platform Editorial Footer */}
      <footer className="bg-carbon-950 border-t border-carbon-900 py-10 text-center text-xs text-carbon-500 font-tech uppercase tracking-wider">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-3xs tracking-widest leading-none">
            © 2026 MISS MOÇAMBIQUE • COMISSÃO NACIONAL DESIGN DE MODA
          </p>
          <div className="flex space-x-4 text-4xs">
            <a href="#compliance" className="hover:text-gold-450 transition">Regras Gerais</a>
            <span>•</span>
            <a href="#compliance" className="hover:text-gold-450 transition">Auditoria Anti-Fraude</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <ContestProvider>
      <MainAppContent />
    </ContestProvider>
  );
}
