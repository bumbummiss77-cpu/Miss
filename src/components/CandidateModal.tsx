/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Candidate, JuryEvaluation } from '../types';
import { useContest } from '../context/ContestContext';
import { 
  X, Heart, Eye, Award, Phone, CreditCard, Lock, CheckCircle2, 
  ChevronLeft, ChevronRight, Play, Star, Sparkles, MessageSquare, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CandidateModalProps {
  candidateId: string;
  onClose: () => void;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({ candidateId, onClose }) => {
  const { 
    candidates, 
    settings, 
    currentVoter, 
    voteCandidate, 
    submitJuryEvaluation, 
    evaluations,
    incrementCandidateViews
  } = useContest();

  const candidate = candidates.find(c => c.id === candidateId);
  
  if (!candidate) return null;

  // Track page views on enter
  useEffect(() => {
    incrementCandidateViews(candidate.id);
  }, [candidate.id]);

  // Image Slider states
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Voting section states
  const [votesCountToBuy, setVotesCountToBuy] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'mpesa' | 'emola' | 'mkesh' | 'visa'>('mpesa');
  const [voterPhoneNumber, setVoterPhoneNumber] = useState('84');
  const [voterNameInput, setVoterNameInput] = useState('');
  const [voterEmailInput, setVoterEmailInput] = useState('');
  const [visaCardNumber, setVisaCardNumber] = useState('');
  const [visaExpiry, setVisaExpiry] = useState('');
  const [visaCVV, setVisaCVV] = useState('');

  // Payment push simulation states
  const [paymentStep, setPaymentStep] = useState<'idle' | 'processing' | 'ussd_prompt' | 'success' | 'failed'>('idle');
  const [ussdPin, setUssdPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Jury assessment states
  const [communicationScore, setCommunicationScore] = useState(8);
  const [presenceScore, setPresenceScore] = useState(8);
  const [confidenceScore, setConfidenceScore] = useState(8);
  const [runwayScore, setRunwayScore] = useState(8);
  const [talentScore, setTalentScore] = useState(8);
  const [juryComment, setJuryComment] = useState('');
  const [juryEvalSuccess, setJuryEvalSuccess] = useState(false);

  // Validate Mozambican mobile wallet prefixes
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setVoterPhoneNumber(value);
  };

  const handlePrevPhoto = () => {
    setActivePhotoIndex(prev => (prev === 0 ? candidate.albumPhotos.length - 1 : prev - 1));
  };

  const handleNextPhoto = () => {
    setActivePhotoIndex(prev => (prev === candidate.albumPhotos.length - 1 ? 0 : prev + 1));
  };

  // Submit votes (either 1 free vote or paid votes bundle)
  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const isPaid = votesCountToBuy > 1;

    // Check free vote viability
    if (!isPaid && !currentVoter.freeVoteAvailable) {
      setErrorMessage('Lamentamos, mas já esgotou o seu voto diário grátis para hoje.');
      return;
    }

    // Phone / Card validation
    if (['mpesa', 'emola', 'mkesh'].includes(selectedPaymentMethod)) {
      if (voterPhoneNumber.length < 9) {
        setErrorMessage('Por favor introduza um número de contacto válido de Moçambique com 9 dígitos.');
        return;
      }
      
      // Prefix compliance checks
      if (selectedPaymentMethod === 'mpesa' && !['84', '85'].includes(voterPhoneNumber.substring(0, 2))) {
        setErrorMessage('Números Vodacom M-Pesa devem começar com 84 ou 85.');
        return;
      }
      if (selectedPaymentMethod === 'emola' && !['86', '87'].includes(voterPhoneNumber.substring(0, 2))) {
        setErrorMessage('Números Movitel e-Mola devem começar com 86 ou 87.');
        return;
      }
      if (selectedPaymentMethod === 'mkesh' && !['82'].includes(voterPhoneNumber.substring(0, 2))) {
        setErrorMessage('Números Tmcel m-Kesh devem começar com 82.');
        return;
      }
    } else {
      // VISA inputs validation
      if (visaCardNumber.length < 16) {
        setErrorMessage('Número do cartão de crédito VISA incompleto.');
        return;
      }
    }

    // Launch simulated mobile push overlay!
    setPaymentStep('processing');

    setTimeout(() => {
      if (selectedPaymentMethod === 'visa') {
        // VISA skips USSD push and goes straight to success check
        setTimeout(() => {
          voteCandidate(candidate.id, votesCountToBuy, 'visa', visaCardNumber, voterNameInput, voterEmailInput);
          setPaymentStep('success');
        }, 1200);
      } else {
        // Mobile wallet triggers beautiful SMS/USSD PIN pop-up context
        setPaymentStep('ussd_prompt');
      }
    }, 1000);
  };

  const handleUssdConfirm = async () => {
    if (ussdPin.length < 4) {
      setErrorMessage('O código PIN de autorização deve conter pelo menos 4 dígitos.');
      return;
    }
    
    setPaymentStep('processing');
    
    // Simulate mobile network gateway validation
    const paymentSuccess = await voteCandidate(
      candidate.id,
      votesCountToBuy,
      selectedPaymentMethod,
      `+258 ${voterPhoneNumber}`,
      voterNameInput,
      voterEmailInput
    );

    if (paymentSuccess) {
      setPaymentStep('success');
    } else {
      setPaymentStep('failed');
      setErrorMessage('Falha na autenticação ou saldo insuficiente na carteira móvel.');
    }
  };

  // Submit official Jury assessment
  const handleJuryScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitJuryEvaluation({
      candidateId: candidate.id,
      communication: communicationScore,
      presence: presenceScore,
      confidence: confidenceScore,
      runway: runwayScore,
      talent: talentScore,
      comment: juryComment
    });
    setJuryEvalSuccess(true);
    setTimeout(() => setJuryEvalSuccess(false), 4000);
  };

  // Filter evaluations just for this candidate
  const candidateEvaluations = evaluations.filter(ev => ev.candidateId === candidate.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-carbon-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        role="dialog" 
        id="candidate-detail-modal"
        className="relative w-full max-w-6xl bg-carbon-900 border border-gold-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh]"
      >
        
        {/* Close Button Trigger */}
        <button 
          id="btn-close-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2.5 bg-carbon-950/70 hover:bg-gold-500 text-gold-300 hover:text-carbon-950 rounded-full border border-gold-500/25 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Image Gallery and Visual portfolio media */}
        <div className="w-full md:w-1/2 bg-carbon-950 flex flex-col justify-between overflow-hidden border-b md:border-b-0 md:border-r border-gold-500/10 min-h-[400px]">
          
          {/* Main Photo Slider view */}
          <div className="relative flex-grow flex items-center justify-center bg-carbon-950 overflow-hidden group">
            <img 
              src={candidate.albumPhotos[activePhotoIndex]} 
              alt={`${candidate.stageName} portfolio`} 
              referrerPolicy="no-referrer"
              className="w-full h-full max-h-[500px] object-cover object-center transition-all duration-500"
            />
            
            {/* Gallery Directional Controls */}
            <button 
              id="btn-prev-photo"
              onClick={handlePrevPhoto}
              className="absolute left-4 p-2 bg-carbon-950/75 text-gold-400 hover:text-gold-200 rounded-full border border-gold-500/15 hover:border-gold-500/40 transition opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              id="btn-next-photo"
              onClick={handleNextPhoto}
              className="absolute right-4 p-2 bg-carbon-950/75 text-gold-400 hover:text-gold-200 rounded-full border border-gold-500/15 hover:border-gold-500/40 transition opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Slider Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-1.5 z-20">
              {candidate.albumPhotos.map((_, i) => (
                <button
                  key={i}
                  id={`btn-photo-dot-${i}`}
                  onClick={() => setActivePhotoIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    activePhotoIndex === i ? 'bg-gold-400 w-4' : 'bg-carbon-500'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Quick Metrics and Stats Banner Bar */}
          <div className="bg-carbon-900/90 border-t border-gold-500/10 p-4 grid grid-cols-3 gap-2 text-center text-xs font-tech tracking-wider">
            <div className="border-r border-carbon-800/80">
              <span className="text-carbon-500 text-3xs block uppercase">Medidas</span>
              <span className="text-gold-200 text-sm font-semibold mt-1 block">
                {candidate.height}cm / {candidate.weight}kg
              </span>
            </div>
            <div className="border-r border-carbon-800/80">
              <span className="text-carbon-500 text-3xs block uppercase">Votos Públicos</span>
              <span className="text-gold-400 text-sm font-semibold font-mono mt-1 block">
                {candidate.votesCount}
              </span>
            </div>
            <div>
              <span className="text-carbon-500 text-3xs block uppercase">Nota Júri</span>
              <span className="text-gold-400 text-sm font-semibold font-mono mt-1 block">
                {candidate.juryScore > 0 ? candidate.juryScore.toFixed(1) : 'Sél. Ativo'}
              </span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Scrolling Information / Interaction Tabs */}
        <div className="w-full md:w-1/2 overflow-y-auto p-6 sm:p-8 flex flex-col space-y-6 max-h-[92vh]">
          
          {/* Header Metadata */}
          <div>
            <span className="text-3xs uppercase font-tech tracking-widest text-gold-400 font-bold block mb-1">
              {candidate.category} • PROVÍNCIA DE {candidate.province.toUpperCase()}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl text-gold-100 font-bold tracking-wide">
              {candidate.fullName}
            </h1>
            <p className="font-sans text-xs text-carbon-400 mt-2 font-medium">
              Nome de Competição: <span className="text-gold-300">{candidate.stageName}</span> • Nacionalidade: <span className="text-carbon-200">{candidate.nationality}</span>
            </p>
          </div>

          {/* Biography Scrollbox */}
          <div className="bg-carbon-950/40 p-4 border border-carbon-800 rounded-xl">
            <h3 className="font-sans text-xs font-semibold text-gold-400 tracking-wider uppercase mb-2">Biografia Curta</h3>
            <p className="font-sans text-xs text-carbon-300 leading-relaxed italic">
              "{candidate.biography}"
            </p>
          </div>

          {/* Full Narrative sections */}
          <div className="space-y-4">
            <div>
              <h4 className="font-sans text-xs font-semibold text-gold-400 tracking-wider uppercase flex items-center mb-1">
                <Sparkles className="w-4 h-4 mr-1.5 text-gold-500" />
                História de Impacto & Projetos Sociais
              </h4>
              <p className="font-sans text-xs text-carbon-300 leading-relaxed">
                {candidate.story}
              </p>
            </div>

            <div>
              <h4 className="font-sans text-xs font-semibold text-gold-400 tracking-wider uppercase flex items-center mb-1">
                <Award className="w-4 h-4 mr-1.5 text-gold-500" />
                Desejo Core & Objetivos no Concurso
              </h4>
              <p className="font-sans text-xs text-carbon-300 leading-relaxed">
                {candidate.motivation}
              </p>
            </div>

            {/* Talent details */}
            <div>
              <h4 className="font-sans text-xs font-semibold text-carbon-400 tracking-wider uppercase mb-2">Talentos de Destaque</h4>
              <div className="flex flex-wrap gap-2">
                {candidate.talents.map((talent, id) => (
                  <span key={id} className="px-3 py-1 bg-carbon-800 text-gold-300 rounded-full font-tech text-3xs border border-gold-500/10">
                    {talent}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Simulation Video Segment */}
          <div className="border border-carbon-800 rounded-xl p-4 bg-carbon-950/50">
            <h4 className="font-sans text-xs font-semibold text-gold-400 tracking-wider uppercase mb-3 flex items-center">
              <Play className="w-4 h-4 mr-1.5 text-gold-500" />
              Vídeos de Apresentação & Passarela (Mocked)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-carbon-950 border border-carbon-800 flex items-center justify-center flex-col cursor-pointer p-2 hover:bg-carbon-900 group">
                <Play className="w-6 h-6 text-gold-400 mb-2 group-hover:scale-110 transition" />
                <span className="font-sans text-4xs text-carbon-300 text-center font-medium">Apresentação Pessoal</span>
                <span className="font-mono text-5xs text-carbon-500 mt-1">35 segundos • HD</span>
              </div>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-carbon-950 border border-carbon-800 flex items-center justify-center flex-col cursor-pointer p-2 hover:bg-carbon-900 group">
                <Play className="w-6 h-6 text-gold-400 mb-2 group-hover:scale-110 transition" />
                <span className="font-sans text-4xs text-carbon-300 text-center font-medium">Técnica de Passarela</span>
                <span className="font-mono text-5xs text-carbon-500 mt-1">45 segundos • HD</span>
              </div>
            </div>
          </div>

          {/* JURY ASSESSMENT DRAWER - Only available for JURY members */}
          {currentVoter.role === 'jury' && (
            <div id="jury-assessment-portal" className="border-2 border-dashed border-gold-500/40 bg-gold-950/5 p-6 rounded-2xl">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-gold-400" />
                <h3 className="font-sans text-sm font-semibold text-gold-300 tracking-wider uppercase">
                  PAINEL DA JURADA OFICIAL
                </h3>
              </div>

              {juryEvalSuccess ? (
                <div className="p-4 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="font-sans text-xs text-emerald-200">Avaliação enviada com sucesso!</p>
                  <p className="font-sans text-3xs text-carbon-400 mt-1">A média ponderada da candidata foi atualizada instantaneamente.</p>
                </div>
              ) : (
                <form onSubmit={handleJuryScoreSubmit} className="space-y-4">
                  <p className="font-sans text-2xs text-carbon-400 leading-normal mb-3">
                    Atribua uma nota de <b>1 a 10</b> para cada um dos quesitos avaliativos regulamentares do concurso:
                  </p>

                  <div className="space-y-3 font-tech text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gold-200 font-medium">1. Lançamento e Comunicação</span>
                        <span className="font-mono text-gold-400 font-bold">{communicationScore}/10</span>
                      </div>
                      <input 
                        type="range" min="1" max="10" step="1"
                        value={communicationScore}
                        onChange={(e) => setCommunicationScore(Number(e.target.value))}
                        className="w-full h-1.5 bg-carbon-800 rounded-lg appearance-none cursor-pointer accent-gold-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gold-200 font-medium">2. Presença de Palco & Elegância</span>
                        <span className="font-mono text-gold-400 font-bold">{presenceScore}/10</span>
                      </div>
                      <input 
                        type="range" min="1" max="10" step="1"
                        value={presenceScore}
                        onChange={(e) => setPresenceScore(Number(e.target.value))}
                        className="w-full h-1.5 bg-carbon-800 rounded-lg appearance-none cursor-pointer accent-gold-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gold-200 font-medium">3. Autoconfiança & Postura</span>
                        <span className="font-mono text-gold-400 font-bold">{confidenceScore}/10</span>
                      </div>
                      <input 
                        type="range" min="1" max="10" step="1"
                        value={confidenceScore}
                        onChange={(e) => setConfidenceScore(Number(e.target.value))}
                        className="w-full h-1.5 bg-carbon-800 rounded-lg appearance-none cursor-pointer accent-gold-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gold-200 font-medium">4. Performance na Passarela (Giga)</span>
                        <span className="font-mono text-gold-400 font-bold">{runwayScore}/10</span>
                      </div>
                      <input 
                        type="range" min="1" max="10" step="1"
                        value={runwayScore}
                        onChange={(e) => setRunwayScore(Number(e.target.value))}
                        className="w-full h-1.5 bg-carbon-800 rounded-lg appearance-none cursor-pointer accent-gold-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gold-200 font-medium">5. Expressão de Talento/Causa</span>
                        <span className="font-mono text-gold-400 font-bold">{talentScore}/10</span>
                      </div>
                      <input 
                        type="range" min="1" max="10" step="1"
                        value={talentScore}
                        onChange={(e) => setTalentScore(Number(e.target.value))}
                        className="w-full h-1.5 bg-carbon-800 rounded-lg appearance-none cursor-pointer accent-gold-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-3xs font-tech tracking-wider uppercase text-carbon-400 mb-1">
                      Parecer & Crítica Acadêmica
                    </label>
                    <textarea 
                      rows={3}
                      value={juryComment}
                      onChange={(e) => setJuryComment(e.target.value)}
                      placeholder="Introduza notas sobre a elegância, postura e impacto social da candidata..."
                      className="w-full px-3 py-2 bg-carbon-950 border border-gold-500/20 hover:border-gold-500/40 rounded-xl text-xs text-gold-100 placeholder-carbon-600 focus:outline-none focus:ring-1 focus:ring-gold-500"
                      required
                    />
                  </div>

                  <button
                    id="btn-submit-jury-evaluation"
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-gold-600 to-gold-400 text-carbon-950 font-sans text-xs font-semibold rounded-xl hover:shadow-lg hover:shadow-gold-500/20 transition-all font-bold"
                  >
                    Confirmar Parecer & Atribuição de Nota
                  </button>
                </form>
              )}
            </div>
          )}

          {/* PUBLIC VOTING BOX - Localized payment methods Mozambique */}
          {settings.allowPublicVoting && (
            <div id="voting-integration-box" className="border border-gold-500/30 bg-carbon-950 p-6 rounded-2xl relative">
              <h3 className="font-sans text-sm font-semibold text-gold-300 tracking-wider uppercase mb-1 flex items-center">
                <Heart className="w-4 h-4 mr-1.5 text-gold-400 fill-gold-400/20" />
                Votar na Candidata
              </h3>
              <p className="font-sans text-3xs text-carbon-400 leading-normal mb-5">
                Escolha o pacote. Votos adicionais apoiam causas e estendem o poder de voto nacional.
              </p>

              {paymentStep === 'success' ? (
                <div className="p-6 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-bounce" />
                  <h4 className="font-sans text-sm font-bold text-emerald-300 uppercase">Sucesso Comercial!</h4>
                  <p className="font-sans text-xs text-emerald-200 mt-1">
                    Processamos {votesCountToBuy} votos para <b>{candidate.stageName}</b>.
                  </p>
                  <p className="font-sans text-3xs text-carbon-500 mt-2">
                    Agradecemos seu apoio nacional à candidata da província de {candidate.province}.
                  </p>
                  <button 
                    onClick={() => { setPaymentStep('idle'); setVotesCountToBuy(1); }}
                    className="mt-4 px-4 py-1.5 bg-carbon-800 text-gold-300 border border-gold-500/30 rounded-lg text-xs"
                  >
                    Votar Novamente
                  </button>
                </div>
              ) : paymentStep === 'processing' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-6 text-center space-y-4 bg-carbon-900/60 border border-gold-500/20 rounded-xl relative overflow-hidden"
                >
                  {/* Radar Scanning Ring Effect */}
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <motion.div 
                      className="absolute inset-0 rounded-full border border-gold-500/30"
                      initial={{ scale: 0.8, opacity: 0.7 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.8, 
                        ease: "easeOut" 
                      }}
                    />
                    <motion.div 
                      className="absolute inset-2 rounded-full border-2 border-dashed border-gold-400/50"
                      animate={{ rotate: 360 }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 8, 
                        ease: "linear" 
                      }}
                    />
                    <motion.div 
                      className="relative z-10 w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/40 flex items-center justify-center text-gold-400"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        borderColor: ["rgba(234, 179, 8, 0.4)", "rgba(234, 179, 8, 0.8)", "rgba(234, 179, 8, 0.4)"] 
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2, 
                        ease: "easeInOut" 
                      }}
                    >
                      <ShieldCheck className="w-5 h-5" />
                    </motion.div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-sans text-xs font-semibold text-gold-300">
                      Processamento de Transação Segura
                    </h4>
                    <p className="font-tech text-[10px] text-carbon-450 tracking-wider">
                      MÉTODO: {selectedPaymentMethod.toUpperCase()} • ENCRYPT_AES_256
                    </p>
                  </div>

                  {/* Staggered Checklist Actions using Framer Motion */}
                  <div className="max-w-xs mx-auto text-left bg-carbon-950/80 p-3.5 border border-carbon-800/80 rounded-lg space-y-2">
                    <motion.div 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center space-x-2 text-3xs text-carbon-300 font-sans"
                    >
                      <motion.div 
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-1.5 h-1.5 rounded-full bg-gold-400" 
                      />
                      <span>Canais móveis encriptados (SSL)</span>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-center space-x-2 text-3xs text-carbon-400 font-sans"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Assinatura criptográfica validada</span>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 }}
                      className="flex items-center space-x-2 text-3xs text-carbon-400 font-sans"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Log de auditoria gerado de forma imutável</span>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.4 }}
                      className="flex items-center space-x-2 text-3xs text-carbon-450 font-sans"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                      <span>Confirmando transição no banco de dados...</span>
                    </motion.div>
                  </div>

                  <p className="font-tech text-[8px] text-carbon-500 uppercase tracking-widest leading-none">
                    Não feche esta janela • Comunicando com Gateway de Moçambique
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleVoteSubmit} className="space-y-4">
                  
                  {/* Select packages */}
                  <div>
                    <label className="block text-3xs font-tech tracking-wider uppercase text-carbon-400 mb-2">
                      Quantidade de Votos
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      <button 
                        type="button"
                        id="btn-qty-1"
                        onClick={() => { setVotesCountToBuy(1); setErrorMessage(''); }}
                        className={`py-2 px-1 rounded-lg border font-mono text-center flex flex-col items-center justify-center transition-all ${
                          votesCountToBuy === 1 
                            ? 'bg-gold-500 text-carbon-950 border-gold-400 font-bold' 
                            : 'bg-carbon-900 border-carbon-800 text-carbon-300 hover:border-carbon-700'
                        }`}
                      >
                        <span className="text-sm">1</span>
                        <span className="text-4xs uppercase tracking-tight">Grátis/Dia</span>
                      </button>

                      <button 
                        type="button"
                        id="btn-qty-10"
                        onClick={() => { setVotesCountToBuy(10); setErrorMessage(''); }}
                        className={`py-2 px-1 rounded-lg border font-mono text-center flex flex-col items-center justify-center transition-all ${
                          votesCountToBuy === 10
                            ? 'bg-gold-500 text-carbon-950 border-gold-400 font-bold' 
                            : 'bg-carbon-900 border-carbon-800 text-carbon-300 hover:border-carbon-700'
                        }`}
                      >
                        <span className="text-sm">10</span>
                        <span className="text-4xs uppercase tracking-tight">{10 * settings.paidVotePriceMZN}MZN</span>
                      </button>

                      <button 
                        type="button"
                        id="btn-qty-50"
                        onClick={() => { setVotesCountToBuy(50); setErrorMessage(''); }}
                        className={`py-2 px-1 rounded-lg border font-mono text-center flex flex-col items-center justify-center transition-all ${
                          votesCountToBuy === 50
                            ? 'bg-gold-500 text-carbon-950 border-gold-400 font-bold' 
                            : 'bg-carbon-900 border-carbon-800 text-carbon-300 hover:border-carbon-700'
                        }`}
                      >
                        <span className="text-sm">50</span>
                        <span className="text-4xs uppercase tracking-tight">{50 * settings.paidVotePriceMZN}MZN</span>
                      </button>

                      <button 
                        type="button"
                        id="btn-qty-100"
                        onClick={() => { setVotesCountToBuy(100); setErrorMessage(''); }}
                        className={`py-2 px-1 rounded-lg border font-mono text-center flex flex-col items-center justify-center transition-all ${
                          votesCountToBuy === 100
                            ? 'bg-gold-500 text-carbon-950 border-gold-400 font-bold' 
                            : 'bg-carbon-900 border-carbon-800 text-carbon-300 hover:border-carbon-700'
                        }`}
                      >
                        <span className="text-sm">100</span>
                        <span className="text-4xs uppercase tracking-tight">{100 * settings.paidVotePriceMZN}MZN</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  {votesCountToBuy > 1 && (
                    <div className="space-y-3.5 pt-2 border-t border-carbon-800 animate-fadeIn bg-carbon-900/40 p-4 rounded-xl">
                      <label className="block text-3xs font-tech tracking-wider uppercase text-carbon-400">
                        Método de Pagamento Moçambique
                      </label>
                      
                      <div className="grid grid-cols-4 gap-2">
                        <button
                          type="button"
                          id="pay-mpesa"
                          onClick={() => { setSelectedPaymentMethod('mpesa'); setErrorMessage(''); }}
                          className={`py-1.5 px-0.5 rounded-lg border flex flex-col items-center transition ${
                            selectedPaymentMethod === 'mpesa' 
                              ? 'bg-red-950/20 text-red-400 border-red-500 font-bold' 
                              : 'bg-carbon-950 border-carbon-800 text-carbon-400'
                          }`}
                        >
                          <span className="text-[10px] font-extrabold uppercase text-xs">M-PESA</span>
                          <span className="text-5xs text-red-500">Vodacom</span>
                        </button>

                        <button
                          type="button"
                          id="pay-emola"
                          onClick={() => { setSelectedPaymentMethod('emola'); setErrorMessage(''); }}
                          className={`py-1.5 px-0.5 rounded-lg border flex flex-col items-center transition ${
                            selectedPaymentMethod === 'emola' 
                              ? 'bg-orange-950/20 text-orange-400 border-orange-500 font-bold' 
                              : 'bg-carbon-950 border-carbon-800 text-carbon-400'
                          }`}
                        >
                          <span className="text-[10px] font-extrabold uppercase text-xs">E-MOLA</span>
                          <span className="text-5xs text-orange-500 font-medium">Movitel</span>
                        </button>

                        <button
                          type="button"
                          id="pay-mkesh"
                          onClick={() => { setSelectedPaymentMethod('mkesh'); setErrorMessage(''); }}
                          className={`py-1.5 px-0.5 rounded-lg border flex flex-col items-center transition ${
                            selectedPaymentMethod === 'mkesh' 
                              ? 'bg-yellow-950/20 text-yellow-400 border-yellow-500 font-bold' 
                              : 'bg-carbon-950 border-carbon-800 text-carbon-400'
                          }`}
                        >
                          <span className="text-[10px] font-semibold uppercase text-xs">m-Kesh</span>
                          <span className="text-5xs text-yellow-500">Tmcel</span>
                        </button>

                        <button
                          type="button"
                          id="pay-visa"
                          onClick={() => { setSelectedPaymentMethod('visa'); setErrorMessage(''); }}
                          className={`py-1.5 px-0.5 rounded-lg border flex flex-col items-center transition ${
                            selectedPaymentMethod === 'visa' 
                              ? 'bg-gold-950/20 text-gold-400 border-gold-500 font-bold' 
                              : 'bg-carbon-950 border-carbon-800 text-carbon-400'
                          }`}
                        >
                          <CreditCard className="w-5 h-5 text-gold-500 mb-0.5" />
                          <span className="text-5xs uppercase tracking-tight">Visa Card</span>
                        </button>
                      </div>

                      {/* Inputs and localized helper details */}
                      <div className="space-y-3 pt-2 text-xs">
                        
                        {/* Spectator Name & Email Inputs */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="block text-4xs uppercase text-carbon-400 mb-1">Seu Nome</span>
                            <input 
                              type="text" 
                              value={voterNameInput}
                              onChange={(e) => setVoterNameInput(e.target.value)}
                              placeholder="Celso Tembe"
                              className="w-full px-2.5 py-1.5 bg-carbon-950 border border-carbon-750 rounded-lg text-gold-100 text-xs placeholder-carbon-600 focus:outline-none focus:ring-1 focus:ring-gold-500"
                            />
                          </div>
                          <div>
                            <span className="block text-4xs uppercase text-carbon-400 mb-1">Seu E-mail</span>
                            <input 
                              type="email" 
                              value={voterEmailInput}
                              onChange={(e) => setVoterEmailInput(e.target.value)}
                              placeholder="celso@gmail.com"
                              className="w-full px-2.5 py-1.5 bg-carbon-950 border border-carbon-750 rounded-lg text-gold-100 text-xs placeholder-carbon-600 focus:outline-none focus:ring-1 focus:ring-gold-500"
                            />
                          </div>
                        </div>

                        {['mpesa', 'emola', 'mkesh'].includes(selectedPaymentMethod) ? (
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-4xs uppercase text-carbon-400">Contacto da Carteira (+258)</span>
                              <span className="font-sans text-4xs text-gold-400 font-bold uppercase">Moçambique</span>
                            </div>
                            <div className="relative">
                              <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-carbon-500" />
                              <input 
                                type="text" 
                                value={voterPhoneNumber}
                                onChange={handlePhoneChange}
                                maxLength={9}
                                placeholder="84XXXXXXX"
                                className="w-full pl-9 pr-3 py-2 bg-carbon-950 border border-carbon-750 font-mono rounded-lg text-xs tracking-wider"
                              />
                            </div>
                            <p className="text-4xs text-carbon-500 mt-1">
                              {selectedPaymentMethod === 'mpesa' && 'Autorizado para Vodacom (84 ou 85).'}
                              {selectedPaymentMethod === 'emola' && 'Autorizado para Movitel (86 ou 87).'}
                              {selectedPaymentMethod === 'mkesh' && 'Autorizado para Tmcel (82).'}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div>
                              <span className="block text-4xs uppercase text-carbon-400 mb-1">Número do Cartão VISA</span>
                              <input 
                                type="text"
                                maxLength={16}
                                value={visaCardNumber}
                                onChange={(e) => setVisaCardNumber(e.target.value.replace(/\D/g, ''))}
                                placeholder="4000 1234 5678 9010"
                                className="w-full px-3 py-2 bg-carbon-950 border border-carbon-750 font-mono rounded-lg text-xs"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="block text-4xs uppercase text-carbon-400 mb-1">Validade (MM/AA)</span>
                                <input 
                                  type="text"
                                  maxLength={5}
                                  value={visaExpiry}
                                  onChange={(e) => setVisaExpiry(e.target.value)}
                                  placeholder="12/29"
                                  className="w-full px-3 py-2 bg-carbon-950 border border-carbon-750 font-mono rounded-lg text-xs"
                                />
                              </div>
                              <div>
                                <span className="block text-4xs uppercase text-carbon-400 mb-1">CVV / Código</span>
                                <input 
                                  type="password"
                                  maxLength={3}
                                  value={visaCVV}
                                  onChange={(e) => setVisaCVV(e.target.value.replace(/\D/g, ''))}
                                  placeholder="***"
                                  className="w-full px-3 py-2 bg-carbon-950 border border-carbon-750 font-mono rounded-lg text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {errorMessage && (
                    <p className="text-3xs font-medium text-rose-450 bg-rose-950/20 p-2 border border-rose-500/25 rounded-lg">
                      {errorMessage}
                    </p>
                  )}

                  <motion.button
                    id="btn-confirm-votes-pago"
                    type="submit"
                    whileHover={{ 
                      scale: 1.02, 
                      boxShadow: "0px 0px 20px rgba(234, 179, 8, 0.4)" 
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="w-full relative overflow-hidden py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-carbon-950 font-sans text-xs font-bold tracking-widest uppercase rounded-xl hover:shadow-lg transition cursor-pointer flex items-center justify-center space-x-1"
                  >
                    {/* Glowing security scanner effect inside the button on hover */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      initial={{ left: "-100%" }}
                      animate={{ left: "100%" }}
                      transition={{ 
                        repeat: Infinity, 
                        repeatType: "loop", 
                        duration: 2, 
                        ease: "linear" 
                      }}
                    />
                    <Lock className="w-3.5 h-3.5 mr-1 relative z-10" />
                    <span className="relative z-10 flex items-center gap-1">
                      {votesCountToBuy === 1 
                        ? `Confirmar 1 Voto Grátis` 
                        : `Comprar & Creditar ${votesCountToBuy} Votos • ${votesCountToBuy * settings.paidVotePriceMZN} MZN`
                      }
                    </span>
                  </motion.button>
                </form>
              )}

              {/* SIMULATED IN-APP MOZAMBICAN POPUP/PUSH NOTIFICATION MODAL */}
              {paymentStep === 'ussd_prompt' && (
                <div 
                  id="ussd-overlay-simulator"
                  className="absolute inset-0 bg-carbon-950/95 flex flex-col justify-center items-center p-6 z-30 transition border border-gold-500 flex-grow"
                >
                  {/* Local Simulating Layout Frame */}
                  <div className="w-full max-w-xs bg-carbon-900 border border-carbon-800 rounded-2xl shadow-xl p-5 border-t-8 border-t-gold-500">
                    <span className="flex items-center text-4xs text-gold-400 font-tech font-bold uppercase tracking-widest mb-1">
                      <Lock className="w-3.5 h-3.5 text-gold-400 mr-1" />
                      {selectedPaymentMethod.toUpperCase()} PUSH SERVICE
                    </span>
                    
                    <h4 className="font-sans text-xs text-carbon-200 mt-2 leading-relaxed">
                      Vodacom / Movitel / Tmcel: Introduza o seu PIN da carteira móvel para autorizar o pagamento de:
                    </h4>
                    
                    <p className="font-mono text-lg font-bold text-gold-300 mt-2">
                      MZN {votesCountToBuy * settings.paidVotePriceMZN},00
                    </p>

                    <p className="font-sans text-4xs text-carbon-400 leading-normal mt-1">
                      Enviado via push de M-Pesa/e-Mola para o número +258 {voterPhoneNumber}.
                    </p>

                    <div className="mt-4">
                      <span className="block text-4xs uppercase text-carbon-400 mb-1">PIN Secreto (Simulado)</span>
                      <input 
                        type="password"
                        maxLength={4}
                        placeholder="••••"
                        value={ussdPin}
                        onChange={(e) => setUssdPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 text-center bg-carbon-950 text-gold-200 font-mono tracking-widest font-extrabold border border-gold-500/30 rounded-xl"
                      />
                    </div>

                    {errorMessage && (
                      <p className="text-4xs text-rose-450 mt-1 text-center font-medium bg-rose-950/20 p-1.5 rounded">{errorMessage}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-5">
                      <motion.button
                        type="button"
                        id="btn-confirm-ussd"
                        onClick={handleUssdConfirm}
                        whileHover={{ scale: 1.03, boxShadow: "0px 0px 12px rgba(234, 179, 8, 0.4)" }}
                        whileTap={{ scale: 0.97 }}
                        className="py-1.5 bg-gold-400 hover:bg-gold-300 text-carbon-950 text-3xs font-bold uppercase tracking-widest rounded-lg cursor-pointer flex items-center justify-center font-bold"
                      >
                        Autorizar
                      </motion.button>
                      <motion.button
                        type="button"
                        id="btn-cancel-ussd"
                        onClick={() => { setPaymentStep('idle'); setUssdPin(''); setErrorMessage(''); }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="py-1.5 bg-carbon-850 hover:bg-carbon-800 text-carbon-400 text-3xs font-bold uppercase tracking-widest rounded-lg cursor-pointer flex items-center justify-center font-bold"
                      >
                        Cancelar
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LIST JURY EVALUATION LOGS */}
          {candidateEvaluations.length > 0 && (
            <div className="border border-carbon-800 p-6 rounded-2xl space-y-4">
              <h3 className="font-sans text-sm font-semibold text-gold-300 tracking-wider uppercase flex items-center">
                <MessageSquare className="w-4 h-4 mr-1.5 text-gold-400" />
                Dossiê & Notas de Jurados ({candidateEvaluations.length})
              </h3>

              <div className="space-y-4">
                {candidateEvaluations.map((ev) => {
                  const itemAvg = (ev.communication + ev.presence + ev.confidence + ev.runway + ev.talent) / 5;
                  return (
                    <div key={ev.id} className="p-4 bg-carbon-950 rounded-xl border border-carbon-850 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-sans font-semibold text-gold-100">{ev.juryName}</p>
                          <p className="font-mono text-4xs text-carbon-500">{new Date(ev.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-gold-950/40 border border-gold-500/20 text-gold-200 rounded font-mono font-bold">
                          MÉDIA: {itemAvg.toFixed(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-1 text-center font-mono text-[9px] text-carbon-400 py-1.5 border-y border-carbon-900">
                        <div>
                          <span className="text-[8px] text-carbon-500 uppercase block">Comun.</span>
                          <b>{ev.communication}</b>
                        </div>
                        <div>
                          <span className="text-[8px] text-carbon-500 uppercase block">Pres.</span>
                          <b>{ev.presence}</b>
                        </div>
                        <div>
                          <span className="text-[8px] text-carbon-500 uppercase block">Conf.</span>
                          <b>{ev.confidence}</b>
                        </div>
                        <div>
                          <span className="text-[8px] text-carbon-500 uppercase block">Pass.</span>
                          <b>{ev.runway}</b>
                        </div>
                        <div>
                          <span className="text-[8px] text-carbon-500 uppercase block">Tal.</span>
                          <b>{ev.talent}</b>
                        </div>
                      </div>

                      <p className="font-sans text-3xs text-carbon-300 leading-normal italic pt-1">
                        "{ev.comment}"
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
