/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Candidate } from '../types';
import { Heart, Eye, Award, MapPin, ChevronRight } from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
  onSelect: () => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onSelect }) => {
  return (
    <div 
      id={`candidate-card-${candidate.id}`}
      onClick={onSelect}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-carbon-800/45 border border-gold-500/10 hover:border-gold-500/40 transition-all duration-500 hover:translate-y-[-4px] shadow-lg hover:shadow-gold-500/5 gold-glow-hover flex flex-col h-full"
    >
      {/* Candidate Image Cover */}
      <div className="relative aspect-[3/4] overflow-hidden bg-carbon-900">
        <div className="absolute inset-0 bg-gradient-to-t from-carbon-950 via-carbon-950/20 to-transparent z-10 opacity-80 group-hover:opacity-65 transition-opacity" />
        
        <img 
          src={candidate.profilePhoto} 
          alt={candidate.fullName} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Province and Category BADGES */}
        <div className="absolute top-4 left-4 z-20 flex flex-col space-y-1.5 items-start">
          <span className="flex items-center px-3 py-1 bg-carbon-950/80 backdrop-blur-md border border-gold-500/35 rounded-full text-2xs font-tech tracking-wider text-gold-300 font-medium">
            <MapPin className="w-3.5 h-3.5 mr-1 text-gold-400" />
            {candidate.province}
          </span>
          <span className="px-2.5 py-0.5 bg-carbon-950/60 backdrop-blur-md rounded-md text-3xs font-sans tracking-wide text-carbon-200">
            {candidate.category}
          </span>
        </div>

        {/* Dynamic score and ranks badge on upper right */}
        {candidate.juryScore > 0 && (
          <div className="absolute top-4 right-4 z-20 flex items-center bg-gold-400 text-carbon-950 px-2.5 py-1 rounded-lg font-mono text-xs font-bold shadow-md">
            <Award className="w-3.5 h-3.5 mr-1" />
            {candidate.juryScore.toFixed(1)}
          </div>
        )}

        {/* Ranking daily evolution indicators */}
        {candidate.dailyVotesChange !== 0 && (
          <div className="absolute bottom-4 left-4 z-20 flex items-center space-x-1.5">
            {candidate.dailyVotesChange > 0 ? (
              <span className="px-2 py-0.5 bg-emerald-900/80 backdrop-blur-md border border-emerald-500/30 rounded text-3xl font-tech text-emerald-300 text-3xs font-medium">
                ▲ +{candidate.dailyVotesChange} pos
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-rose-950/80 backdrop-blur-md border border-rose-500/30 rounded text-3xl font-tech text-rose-300 text-3xs font-medium">
                ▼ {candidate.dailyVotesChange} pos
              </span>
            )}
          </div>
        )}
      </div>

      {/* Candidate Metadata and Details */}
      <div className="p-5 flex flex-col flex-grow z-20 relative bg-carbon-950/50">
        <h3 className="font-display text-xl text-gold-100 font-semibold tracking-wide truncate group-hover:text-gold-300 transition-colors">
          {candidate.stageName}
        </h3>
        <p className="font-sans text-xs text-carbon-400 mt-2 line-clamp-2 leading-relaxed italic h-8">
          "{candidate.biography}"
        </p>

        {/* Standard Pageantry Specifications */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-carbon-800/60 font-tech text-3xs text-carbon-400 tracking-wider uppercase">
          <div>
            <span className="text-carbon-500 block">Altura</span>
            <span className="text-gold-200 font-medium font-mono text-xs block mt-0.5">
              {candidate.height} cm
            </span>
          </div>
          <div>
            <span className="text-carbon-500 block">Idade</span>
            <span className="text-gold-200 font-medium font-mono text-xs block mt-0.5">
              {candidate.age} anos
            </span>
          </div>
        </div>

        {/* Engagement Stats and Trigger */}
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-carbon-800/80">
          <div className="flex items-center space-x-3 text-carbon-400">
            <span className="flex items-center space-x-1 font-mono text-3xs">
              <Heart className="w-3.5 h-3.5 text-gold-500 fill-gold-500/10" />
              <b className="text-gold-200 font-semibold">{candidate.votesCount}</b>
            </span>
            <span className="flex items-center space-x-1 font-mono text-3xs">
              <Eye className="w-3.5 h-3.5 text-carbon-500" />
              <span>{candidate.viewsCount}</span>
            </span>
          </div>

          <button 
            id={`btn-view-${candidate.id}`}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="flex items-center text-3xs font-tech uppercase tracking-widest text-gold-400 group-hover:text-gold-300 transition-all font-medium"
          >
            Ver Portfólio
            <ChevronRight className="w-3.5 h-3.5 ml-0.5 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
