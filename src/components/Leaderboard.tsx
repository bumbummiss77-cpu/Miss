/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useContest } from '../context/ContestContext';
import { Candidate } from '../types';
import { Award, Heart, Trophy, MapPin, Eye, ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const { candidates, settings } = useContest();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showFormulaTooltip, setShowFormulaTooltip] = useState(false);

  // Math Normalizing calculation for Public Votes
  const maxVotes = Math.max(...candidates.map(c => c.votesCount), 1);

  // Generate Ranked List with Mathematical Weighting logic
  const rankedCandidates = candidates
    .filter(c => filterCategory === 'all' || c.category === filterCategory)
    .map(c => {
      // Normalize public votes to a 0 - 10 scale
      const publicNorm = (c.votesCount / maxVotes) * 10;
      const juryNorm = c.juryScore || 7.5; // default fallback if no jury logged yet

      // Balanced Weight formula
      const finalVal = (settings.juryVoteWeight / 100.0) * juryNorm + (settings.publicVoteWeight / 100.0) * publicNorm;
      const percentageScore = parseFloat((finalVal * 10).toFixed(1)); // Scale to 100%

      return {
        ...c,
        publicScoreNorm: publicNorm,
        percentageScore
      };
    })
    .sort((a, b) => b.percentageScore - a.percentageScore);

  const podiumCandidates = rankedCandidates.slice(0, 3);
  const remainingCandidates = rankedCandidates.slice(3);

  // Helper styles for podium orders
  const getPodiumOrderStyles = (index: number) => {
    switch (index) {
      case 0: return {
        cardClass: 'border-gold-450 bg-gradient-to-t from-gold-950/20 via-carbon-900 to-carbon-900 border-2',
        ringStyle: 'ring-4 ring-gold-400',
        badge: 'bg-gold-500 text-carbon-950',
        label: '1º Lugar'
      };
      case 1: return {
        cardClass: 'border-slate-400 bg-carbon-900/90 border',
        ringStyle: 'ring-2 ring-slate-300',
        badge: 'bg-slate-300 text-carbon-950',
        label: '2º Lugar'
      };
      case 2: return {
        cardClass: 'border-amber-700 bg-carbon-900/90 border',
        ringStyle: 'ring-2 ring-amber-600',
        badge: 'bg-amber-600 text-carbon-950',
        label: '3º Lugar'
      };
      default: return {
        cardClass: '',
        ringStyle: '',
        badge: '',
        label: ''
      };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      
      {/* Title & Mathematical Formula Explanation Banner */}
      <div className="text-center relative max-w-2xl mx-auto space-y-3">
        <span className="text-3xs tracking-widest text-gold-400 uppercase font-tech font-bold block">
          Evolução ao Vivo
        </span>
        <h1 className="font-display text-4xl text-gold-100 font-bold tracking-tight">
          Classificação Oficial
        </h1>
        <p className="font-sans text-xs text-carbon-350 leading-relaxed">
          Tabela ponderada unindo a votação do público online à avaliação individual da banca julgadora do concurso.
        </p>

        {/* Dynamic Formula Display block */}
        <div className="p-3 bg-carbon-950/60 rounded-xl inline-flex items-center space-x-1.5 border border-carbon-850 justify-center">
          <span className="font-tech text-3xs text-carbon-500 uppercase">Fórmula:</span>
          <span className="font-mono text-3xs text-gold-400 font-medium">
            ({settings.publicVoteWeight}% Público) + ({settings.juryVoteWeight}% Jurados)
          </span>
          <div className="relative">
            <button 
              id="btn-tooltip-formula"
              onMouseEnter={() => setShowFormulaTooltip(true)}
              onMouseLeave={() => setShowFormulaTooltip(false)}
              className="text-carbon-400 hover:text-gold-300 cursor-help"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
            {showFormulaTooltip && (
              <div 
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 bg-carbon-900 border border-gold-500/30 p-2.5 rounded-lg text-4xs text-carbon-300 leading-normal z-30 shadow-xl"
                id="tooltip-formula"
              >
                Os votos públicos são normalizados de 0 a 10 tomando o líder como base. A média de notas dos jurados flutua de 1 a 10. O indicador final reflete o peso proporcional selecionado.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex justify-center space-x-2">
        {['all', 'Miss Moçambique (Sénior)', 'Miss Teen Moçambique', 'Miss Pérola Moçambique (Cultural/Talento)'].map((cat) => (
          <button
            key={cat}
            id={`filter-lead-${cat.replace(/\s+/g, '-')}`}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-sans tracking-wide transition ${
              filterCategory === cat
                ? 'bg-gold-500 text-carbon-950 font-semibold shadow-md shadow-gold-500/10'
                : 'bg-carbon-900/50 hover:bg-carbon-900 text-carbon-300 border border-gold-500/5'
            }`}
          >
            {cat === 'all' ? 'Ver Todas' : cat.replace(' Moçambique', '')}
          </button>
        ))}
      </div>

      {rankedCandidates.length === 0 ? (
        <div className="text-center py-16 text-xs text-carbon-500 border border-dashed border-carbon-800 rounded-2xl">
          Nenhuma candidata inscrita ou aprovada nesta categoria até o momento.
        </div>
      ) : (
        <>
          {/* THE GOLDEN PODIUM: TOP 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-6 items-end relative">
            
            {/* 2nd Place (Renders Left on Desktop) */}
            {podiumCandidates[1] && (
              <div 
                id="podium-2"
                className={`order-2 md:order-1 flex flex-col items-center p-6 rounded-2xl text-center self-end ${getPodiumOrderStyles(1).cardClass}`}
              >
                <div className="relative mb-4">
                  <div className={`w-20 h-20 rounded-full overflow-hidden ${getPodiumOrderStyles(1).ringStyle}`}>
                    <img 
                      src={podiumCandidates[1].profilePhoto} 
                      alt={podiumCandidates[1].stageName} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-4xs font-mono font-bold ${getPodiumOrderStyles(1).badge}`}>
                    {getPodiumOrderStyles(1).label}
                  </span>
                </div>

                <h3 className="font-display text-lg text-slate-100 font-semibold truncate max-w-[180px]">
                  {podiumCandidates[1].stageName}
                </h3>
                <span className="font-tech text-4xs text-carbon-400 mt-1 uppercase max-w-[160px] truncate block">
                  Província de {podiumCandidates[1].province}
                </span>

                <div className="font-mono text-xl font-bold text-slate-300 mt-3">
                  {podiumCandidates[1].percentageScore}%
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-carbon-800/60 w-full text-5xs text-carbon-500 uppercase tracking-widest font-mono">
                  <div>
                    <span>Votos</span>
                    <span className="text-carbon-300 block font-semibold text-2xs mt-0.5">{podiumCandidates[1].votesCount}</span>
                  </div>
                  <div>
                    <span>Nota Júri</span>
                    <span className="text-carbon-300 block font-semibold text-2xs mt-0.5">
                      {podiumCandidates[1].juryScore > 0 ? podiumCandidates[1].juryScore.toFixed(1) : 'Sél.'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 1st Place (Renders Center, Taller Card) */}
            {podiumCandidates[0] && (
              <div 
                id="podium-1"
                className={`order-1 md:order-2 flex flex-col items-center p-8 rounded-2xl text-center relative z-15 shadow-gold-500/10 shadow-xl ${getPodiumOrderStyles(0).cardClass}`}
              >
                {/* Crown Asset */}
                <div className="absolute top-[-24px] bg-gradient-to-r from-gold-500 to-gold-400 p-2.5 rounded-full ring-4 ring-carbon-950 font-bold z-20">
                  <Trophy className="w-5 h-5 text-carbon-950" />
                </div>

                <div className="relative mb-5 mt-2">
                  <div className={`w-28 h-28 rounded-full overflow-hidden ${getPodiumOrderStyles(0).ringStyle}`}>
                    <img 
                      src={podiumCandidates[0].profilePhoto} 
                      alt={podiumCandidates[0].stageName} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-3xs font-mono font-bold tracking-wider uppercase ${getPodiumOrderStyles(0).badge}`}>
                    {getPodiumOrderStyles(0).label}
                  </span>
                </div>

                <h3 className="font-display text-2xl text-gold-200 font-semibold truncate max-w-[220px]">
                  {podiumCandidates[0].stageName}
                </h3>
                <span className="font-tech text-4xs text-gold-400 mt-1 uppercase max-w-[180px] truncate block font-semibold">
                  Província de {podiumCandidates[0].province}
                </span>

                <div className="font-mono text-3xl font-extrabold text-gold-400 mt-4">
                  {podiumCandidates[0].percentageScore}%
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-gold-500/10 w-full text-5xs text-carbon-500 uppercase tracking-widest font-mono">
                  <div>
                    <span>Votos de Público</span>
                    <span className="text-gold-200 block font-semibold text-xs mt-0.5">{podiumCandidates[0].votesCount}</span>
                  </div>
                  <div>
                    <span>Nota Oficial Júri</span>
                    <span className="text-gold-200 block font-semibold text-xs mt-0.5">
                      {podiumCandidates[0].juryScore > 0 ? podiumCandidates[0].juryScore.toFixed(1) : 'Sél.'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place (Renders Right on Desktop) */}
            {podiumCandidates[2] && (
              <div 
                id="podium-3"
                className={`order-3 flex flex-col items-center p-6 rounded-2xl text-center self-end ${getPodiumOrderStyles(2).cardClass}`}
              >
                <div className="relative mb-4">
                  <div className={`w-20 h-20 rounded-full overflow-hidden ${getPodiumOrderStyles(2).ringStyle}`}>
                    <img 
                      src={podiumCandidates[2].profilePhoto} 
                      alt={podiumCandidates[2].stageName} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-4xs font-mono font-bold ${getPodiumOrderStyles(2).badge}`}>
                    {getPodiumOrderStyles(2).label}
                  </span>
                </div>

                <h3 className="font-display text-lg text-amber-100 font-semibold truncate max-w-[180px]">
                  {podiumCandidates[2].stageName}
                </h3>
                <span className="font-tech text-4xs text-carbon-400 mt-1 uppercase max-w-[160px] truncate block">
                  Província de {podiumCandidates[2].province}
                </span>

                <div className="font-mono text-xl font-bold text-amber-500 mt-3">
                  {podiumCandidates[2].percentageScore}%
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-carbon-800/60 w-full text-5xs text-carbon-500 uppercase tracking-widest font-mono">
                  <div>
                    <span>Votos</span>
                    <span className="text-carbon-300 block font-semibold text-2xs mt-0.5">{podiumCandidates[2].votesCount}</span>
                  </div>
                  <div>
                    <span>Nota Júri</span>
                    <span className="text-carbon-300 block font-semibold text-2xs mt-0.5">
                      {podiumCandidates[2].juryScore > 0 ? podiumCandidates[2].juryScore.toFixed(1) : 'Sél.'}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* THE REMAINING LIST TABULAR GRAPHIC */}
          {remainingCandidates.length > 0 && (
            <div className="bg-carbon-900 border border-gold-500/10 rounded-2xl shadow-xl overflow-hidden max-w-5xl mx-auto">
              {/* Header Titles */}
              <div className="hidden sm:grid grid-cols-12 gap-2 p-4 bg-carbon-950 font-tech text-4xs tracking-widest text-carbon-400 uppercase font-medium border-b border-gold-500/5">
                <div className="col-span-1 text-center">Pos</div>
                <div className="col-span-4 pl-4">Candidata</div>
                <div className="col-span-2">Província</div>
                <div className="col-span-2 text-center">Votos Públicos</div>
                <div className="col-span-1 text-center">Média Júri</div>
                <div className="col-span-2 text-right pr-4">Média Ponderada</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-carbon-850">
                {remainingCandidates.map((c, idx) => {
                  const absolutePosition = idx + 4;
                  return (
                    <div 
                      key={c.id}
                      id={`lead-row-${c.id}`}
                      className="grid grid-cols-5 sm:grid-cols-12 gap-2 items-center p-4 hover:bg-carbon-800/30 transition text-xs"
                    >
                      {/* Pos */}
                      <div className="col-span-1 flex items-center justify-center font-mono font-bold text-carbon-450">
                        {absolutePosition}º
                      </div>

                      {/* Info and Portrait */}
                      <div className="col-span-3 sm:col-span-4 flex items-center space-x-3 pl-2 sm:pl-4">
                        <img 
                          src={c.profilePhoto} 
                          alt={c.stageName} 
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-gold-500/30 font-bold" 
                        />
                        <div className="truncate">
                          <p className="font-display text-sm text-gold-100 font-semibold truncate">{c.stageName}</p>
                          <p className="text-4xs text-carbon-400 uppercase tracking-wide truncate">{c.category}</p>
                        </div>
                      </div>

                      {/* Province */}
                      <div className="hidden sm:col-span-2 text-gold-300 font-tech font-medium uppercase tracking-wide">
                        {c.province}
                      </div>

                      {/* Public Votes */}
                      <div className="col-span-1 sm:col-span-2 text-center font-mono text-carbon-200">
                        <span className="sm:hidden block text-5xs uppercase text-carbon-500">Votos</span>
                        {c.votesCount}
                      </div>

                      {/* Official Jury score */}
                      <div className="hidden sm:col-span-1 text-center font-mono text-carbon-200 font-semibold">
                        {c.juryScore > 0 ? c.juryScore.toFixed(1) : '-'}
                      </div>

                      {/* Mathematical Final weighted Score */}
                      <div className="col-span-2 text-right pr-2 sm:pr-4 font-mono font-extrabold text-gold-400 text-sm">
                        <span className="sm:hidden block text-5xs uppercase text-carbon-500 text-right">Peso</span>
                        {c.percentageScore}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
};
