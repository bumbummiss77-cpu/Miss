/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useContest } from '../context/ContestContext';
import { MOZAMBIQUE_PROVINCES, CONTEST_CATEGORIES } from '../data/mockData';
import { User, Image, AlignLeft, ShieldAlert, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';

// Elite presets for portrait photos so testers can quickly click and fill!
const PORTRAIT_PRESETS = [
  { name: 'Modelo Tranças', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=400' },
  { name: 'Modelo Cachas', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400' },
  { name: 'Modelo Sorriso', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=400' }
];

const BODY_PRESETS = [
  { name: 'Passarela 1', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=400' },
  { name: 'Passarela 2', url: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=400' }
];

export const RegistrationForm: React.FC = () => {
  const { addCandidate } = useContest();

  // Multi-step signup form states
  const [activeStep, setActiveStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Core candidate parameters
  const [fullName, setFullName] = useState('');
  const [stageName, setStageName] = useState('');
  const [birthDate, setBirthDate] = useState('25/05/2003');
  const [nationality, setNationality] = useState('Moçambicana');
  const [province, setProvince] = useState(MOZAMBIQUE_PROVINCES[0]);
  const [category, setCategory] = useState(CONTEST_CATEGORIES[0]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('84');
  const [instagram, setInstagram] = useState('');
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(55);
  const [biography, setBiography] = useState('');
  const [story, setStory] = useState('');
  const [motivation, setMotivation] = useState('');
  const [talents, setTalents] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(PORTRAIT_PRESETS[0].url);
  const [bodyPhoto, setBodyPhoto] = useState(BODY_PRESETS[1].url);

  // Compliance parameters
  const [consentRules, setConsentRules] = useState(false);
  const [consentImage, setConsentImage] = useState(false);
  const [identityCardChecked, setIdentityCardChecked] = useState(false);

  // Auto age calculator
  const calculateAge = (dobString: string): number => {
    try {
      const year = parseInt(dobString.split('-')[0]);
      if (isNaN(year)) return 22;
      return new Date().getFullYear() - year;
    } catch {
      return 22;
    }
  };

  const handleTalentToggle = (talent: string) => {
    setTalents(prev => prev.includes(talent) ? prev.filter(t => t !== talent) : [...prev, talent]);
  };

  const handleNextStep = () => {
    setActiveStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName === '' || stageName === '' || email === '') return;

    const computedAge = calculateAge(birthDate);

    addCandidate({
      fullName,
      stageName,
      birthDate,
      age: computedAge,
      nationality,
      province,
      biography,
      story,
      motivation,
      category,
      height,
      weight,
      talents,
      experience,
      profilePhoto,
      bodyPhoto,
      albumPhotos: [profilePhoto, bodyPhoto],
      status: 'pending', // Admins approve on dashboard as required
      active: true
    });

    setFormSubmitted(true);
  };

  const resetForm = () => {
    setFullName('');
    setStageName('');
    setBirthDate('2003-05-25');
    setNationality('Moçambicana');
    setProvince(MOZAMBIQUE_PROVINCES[0]);
    setEmail('');
    setPhone('84');
    setInstagram('');
    setHeight(175);
    setWeight(55);
    setBiography('');
    setStory('');
    setMotivation('');
    setTalents([]);
    setExperience('');
    setConsentRules(false);
    setConsentImage(false);
    setIdentityCardChecked(false);
    setActiveStep(1);
    setFormSubmitted(false);
  };

  const standardTalentOptions = [
    'Dança Tradicional',
    'Canto Lírico/Mod.',
    'Oratória Pública',
    'Atuação/Teatro',
    'Passarela Giga',
    'Poesia Falada',
    'Artes Cênicas'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      
      {/* Title block */}
      <div className="text-center mb-8 space-y-2">
        <span className="text-3xs tracking-widest text-gold-400 uppercase font-tech font-bold block">
          Inscrições Moçambique
        </span>
        <h1 className="font-display text-4xl text-gold-100 font-bold tracking-tight">
          Candidatar-se ao Concurso
        </h1>
        <p className="font-sans text-xs text-carbon-450 max-w-lg mx-auto">
          Faça parte da história da moda moçambicana. Preencha a candidatura oficial para análise da organização.
        </p>

        {/* Phase Indicator Steps */}
        <div className="flex justify-center items-center space-x-2 pt-6 font-tech text-3xs tracking-widest text-carbon-400">
          <span className={`px-2 py-1 rounded ${activeStep === 1 ? 'bg-gold-500 text-carbon-950 font-bold' : 'bg-carbon-900 border border-carbon-800'}`}>
            1. Dados Pessoais
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-carbon-600" />
          <span className={`px-2 py-1 rounded ${activeStep === 2 ? 'bg-gold-500 text-carbon-950 font-bold' : 'bg-carbon-900 border border-carbon-800'}`}>
            2. Portfólio & Média
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-carbon-600" />
          <span className={`px-2 py-1 rounded ${activeStep === 3 ? 'bg-gold-500 text-carbon-950 font-bold' : 'bg-carbon-900 border border-carbon-800'}`}>
            3. Identidade & Termos
          </span>
        </div>
      </div>

      {formSubmitted ? (
        <div className="bg-carbon-900 border border-gold-500/30 p-8 rounded-2xl text-center space-y-4 max-w-md mx-auto">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-pulse" />
          <h2 className="font-display text-2xl text-gold-200 font-bold uppercase">Candidatura Registada!</h2>
          
          <p className="font-sans text-xs text-carbon-300 leading-relaxed text-center">
            Parabéns, <b>{fullName}</b>! A sua inscrição para o concurso <b>Miss Moçambique 2026</b> foi inserida em nosso banco de dados.
          </p>

          <div className="bg-carbon-950 p-4 border border-carbon-850 rounded-xl text-left font-mono text-[10px] space-y-1.5">
            <p className="text-gold-450"><span className="text-carbon-500 font-sans">ID Interno:</span> #CAND-{Date.now().toString().substring(7)}</p>
            <p><span className="text-carbon-500 font-sans">Província:</span> {province}</p>
            <p><span className="text-carbon-500 font-sans">Status Inicial:</span> <span className="px-1.5 py-0.5 bg-yellow-950 text-yellow-500 rounded font-bold">Pendente</span></p>
            <p className="text-carbon-400 text-5xs leading-normal pt-1.5 font-sans">
              Para efetivar o portfólio no painel principal, altere utilizador para "Administrador" e aprove esta ficha na seção administrativa.
            </p>
          </div>

          <button
            onClick={resetForm}
            className="w-full py-2.5 bg-gradient-to-r from-gold-600 to-gold-400 text-carbon-950 text-xs font-bold rounded-xl shadow-lg hover:shadow-gold-500/10 cursor-pointer transition uppercase"
          >
            Submeter Nova Ficha
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-carbon-900 border border-gold-500/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
          
          {/* STEP 1: PERSONAL, MEASUREMENTS, CONTACTS */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-gold-400 border-b border-carbon-800 pb-3">
                <User className="w-4 h-4 text-gold-500" />
                <h3 className="font-sans text-[13px] font-semibold tracking-wider uppercase">Ficha Cadastral Básica</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-3xs font-tech tracking-wider uppercase text-carbon-450 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Joana Teresa Muthemba"
                    className="w-full px-3 py-2 bg-carbon-950 border border-carbon-800 rounded-xl text-xs placeholder-carbon-700"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-tech tracking-wider uppercase text-carbon-450 mb-1">Nome Artístico / Competição</label>
                  <input
                    type="text"
                    required
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    placeholder="Joana Muthemba"
                    className="w-full px-3 py-2 bg-carbon-950 border border-carbon-800 rounded-xl text-xs placeholder-carbon-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-3xs font-tech tracking-wider uppercase text-carbon-450 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-carbon-950 border border-carbon-800 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-tech tracking-wider uppercase text-carbon-450 mb-1">Nacionalidade</label>
                  <input
                    type="text"
                    required
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full px-3 py-2 bg-carbon-950 border border-carbon-800 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-tech tracking-wider uppercase text-carbon-450 mb-1">Província de Representação</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3 py-2 bg-carbon-950 border border-carbon-800 rounded-xl text-xs text-gold-200 font-medium"
                  >
                    {MOZAMBIQUE_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-carbon-850/60">
                <div>
                  <label className="block text-3xs font-tech tracking-wider uppercase text-carbon-450 mb-1">Categoria de Entrada</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-carbon-950 border border-carbon-800 rounded-xl text-xs text-gold-200"
                  >
                    {CONTEST_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-3xs font-tech tracking-wider uppercase text-carbon-450 mb-1">Altura (cm)</label>
                    <input
                      type="number"
                      required
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      placeholder="176"
                      className="w-full px-3 py-2 bg-carbon-950 border border-carbon-800 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-tech tracking-wider uppercase text-carbon-450 mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      required
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      placeholder="54"
                      className="w-full px-3 py-2 bg-carbon-950 border border-carbon-800 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-carbon-850/60">
                <div>
                  <label className="block text-3xs font-tech tracking-wider uppercase text-carbon-450 mb-1">Correio Eletrónico</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="joana@muthemba.co.mz"
                    className="w-full px-3 py-2 bg-carbon-950 border border-carbon-800 rounded-xl text-xs placeholder-carbon-700"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-tech tracking-wider uppercase text-carbon-450 mb-1">Telefone / M-Pesa Carteira</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="84XXXXXXX"
                    className="w-full px-3 py-2 bg-carbon-950 border border-carbon-800 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-tech tracking-wider uppercase text-carbon-450 mb-1">Perfil Oficial Instagram</label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@joana_muthemba"
                    className="w-full px-3 py-2 bg-carbon-950 border border-carbon-800 rounded-xl text-xs placeholder-carbon-700"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  id="btn-reg-next-1"
                  onClick={handleNextStep}
                  disabled={!fullName || !stageName || !email}
                  className="px-6 py-2 bg-gold-500 disabled:opacity-50 text-carbon-950 font-sans text-xs font-extrabold rounded-xl hover:shadow-lg transition cursor-pointer"
                >
                  Seguinte: Portfólio
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PORTFOLIO & IMAGES PRESETS */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-gold-400 border-b border-carbon-800 pb-3">
                <Image className="w-4 h-4 text-gold-500" />
                <h3 className="font-sans text-[13px] font-semibold tracking-wider uppercase">Lançamento de Portfólio & Média</h3>
              </div>

              {/* Curated Portait photo selector preset list to save typing! */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-3xs font-tech tracking-wider uppercase text-carbon-450">Foto de Rosto (Close-Up) URL</label>
                    <span className="text-[10px] text-gold-450 italic">Clique num retrato abaixo para preenchimento rápido:</span>
                  </div>
                  
                  {/* Row of quick click choices */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {PORTRAIT_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        id={`preset-face-${preset.name.replace(/\s+/g, '-')}`}
                        onClick={() => setProfilePhoto(preset.url)}
                        className={`p-2 bg-carbon-950 border rounded-lg text-left transition flex items-center space-x-2 ${
                          profilePhoto === preset.url ? 'border-gold-400 ring-1 ring-gold-450' : 'border-carbon-800'
                        }`}
                      >
                        <img src={preset.url} referrerPolicy="no-referrer" alt={preset.name} className="w-8 h-8 rounded-full object-cover" />
                        <span className="text-4xs text-carbon-350">{preset.name}</span>
                      </button>
                    ))}
                  </div>

                  <input
                    type="url"
                    required
                    value={profilePhoto}
                    onChange={(e) => setProfilePhoto(e.target.value)}
                    className="w-full px-3 py-2 bg-carbon-950 border border-carbon-800 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-3xs font-tech tracking-wider uppercase text-carbon-450">Foto de Corpo Inteiro URL</label>
                    <span className="text-[10px] text-gold-450 italic">Escolha uma pose de passarela:</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {BODY_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        id={`preset-body-${preset.name.replace(/\s+/g, '-')}`}
                        onClick={() => setBodyPhoto(preset.url)}
                        className={`p-2 bg-carbon-950 border rounded-lg text-left transition flex items-center space-x-2 ${
                          bodyPhoto === preset.url ? 'border-gold-400 ring-1 ring-gold-450' : 'border-carbon-800'
                        }`}
                      >
                        <img src={preset.url} referrerPolicy="no-referrer" alt={preset.name} className="w-8 h-8 rounded-full object-cover animate-pulse" />
                        <span className="text-4xs text-carbon-350">{preset.name}</span>
                      </button>
                    ))}
                  </div>

                  <input
                    type="url"
                    required
                    value={bodyPhoto}
                    onChange={(e) => setBodyPhoto(e.target.value)}
                    className="w-full px-3 py-2 bg-carbon-950 border border-carbon-800 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Biography input */}
              <div className="space-y-3 pt-3 border-t border-carbon-850/60">
                <div>
                  <label className="block text-3xs font-tech tracking-wider uppercase text-carbon-450 mb-1">Biografia Curta (Até 300 Caracteres)</label>
                  <textarea
                    rows={2}
                    required
                    maxLength={300}
                    value={biography}
                    onChange={(e) => setBiography(e.target.value)}
                    placeholder="Conte sobre você, seu local de nascimento e aspirações artísticas rápidas..."
                    className="w-full px-3 py-2 bg-carbon-950 border border-carbon-800 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-3xs font-tech tracking-wider uppercase text-carbon-450 mb-1">Projetos Sociais & Luta Pessoal</label>
                  <textarea
                    rows={3}
                    required
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    placeholder="Nos descreva seus esforços comunitários. Qual causa social você lidera em Moçambique?"
                    className="w-full px-3 py-2 bg-carbon-950 border border-carbon-800 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-3xs font-tech tracking-wider uppercase text-carbon-450 mb-1">Histórico Profissional em Modelagem / Eventos</label>
                  <textarea
                    rows={2}
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="Maputo Fashion Week 2024, passarela comunitária, book fotográficos ou marcas..."
                    className="w-full px-3 py-2 bg-carbon-950 border border-carbon-800 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-carbon-800">
                <button
                  type="button"
                  id="btn-reg-prev-2"
                  onClick={handlePrevStep}
                  className="px-5 py-2 bg-carbon-800 text-carbon-300 font-sans text-xs rounded-xl hover:bg-carbon-750 transition"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  id="btn-reg-next-2"
                  onClick={handleNextStep}
                  disabled={!biography || !story}
                  className="px-6 py-2 bg-gold-500 disabled:opacity-50 text-carbon-950 font-sans text-xs font-extrabold rounded-xl hover:shadow-lg transition cursor-pointer"
                >
                  Seguinte: Identidade & Termos
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONVERGENT RULES, IDENTITIES check and SUBMIT */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-gold-400 border-b border-carbon-800 pb-3">
                <AlignLeft className="w-4 h-4 text-gold-500" />
                <h3 className="font-sans text-[13px] font-semibold tracking-wider uppercase">Identidade e Declarações Legais</h3>
              </div>

              {/* Talents selector */}
              <div>
                <label className="block text-3xs font-tech tracking-wider uppercase text-carbon-450 mb-3">Selecione Seus Talentos Principais</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {standardTalentOptions.map((talent) => (
                    <button
                      key={talent}
                      type="button"
                      id={`talent-tag-${talent.replace(/\s+/g, '-')}`}
                      onClick={() => handleTalentToggle(talent)}
                      className={`py-2 px-3 rounded-lg border text-left text-xs transition flex items-center justify-between ${
                        talents.includes(talent)
                          ? 'bg-gold-500 text-carbon-950 border-gold-400 font-semibold'
                          : 'bg-carbon-950 border-carbon-850 text-carbon-400 hover:border-carbon-800'
                      }`}
                    >
                      <span>{talent}</span>
                      {talents.includes(talent) && <span className="font-bold text-[10px]">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* ID Verification simulate frame */}
              <div className="bg-carbon-950 border border-carbon-800 p-4 rounded-xl space-y-4">
                <div className="flex items-start space-x-3 text-gold-300">
                  <ShieldAlert className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold tracking-wider uppercase">Controle de Segurança de Fichas (KYC)</h4>
                    <p className="text-4xs text-carbon-400 leading-normal mt-1">
                      Para mitigar perfis falsos e cadastros automatizados, a organização requer que todas candidatas aceitem os testes de legitimidade documentar abaixo.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-carbon-900 border-dotted text-xs text-carbon-350">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input 
                      type="checkbox"
                      id="chk-id-verify"
                      checked={identityCardChecked}
                      onChange={(e) => setIdentityCardChecked(e.target.checked)}
                      className="mt-1 accent-gold-500"
                    />
                    <span className="leading-tight">
                      Confirmo possuir Documento de Identificação (B.I., Passaporte ou Direção DIRE) moçambicano e aceito submeter foto da selfie para aprovação manual dos administradores.
                    </span>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input 
                      type="checkbox"
                      id="chk-rules"
                      checked={consentRules}
                      onChange={(e) => setConsentRules(e.target.checked)}
                      className="mt-1 accent-gold-500"
                    />
                    <span className="leading-tight">
                      Aceito integralmente as regras internas de etiqueta, comportamento desportivo, ética de modelagem e as fases eliminatórias do concurso Edição 2026.
                    </span>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input 
                      type="checkbox"
                      id="chk-image-rights"
                      checked={consentImage}
                      onChange={(e) => setConsentImage(e.target.checked)}
                      className="mt-1 accent-gold-500"
                    />
                    <span className="leading-tight">
                      Concedo à organização da plataforma permissão total de transmissão de fotografias, reels, e talentos para fins de divulgação cultural e votação do público em redes abertas.
                    </span>
                  </label>
                </div>
              </div>

              {/* Navigation button arrays */}
              <div className="flex justify-between pt-4 border-t border-carbon-800">
                <button
                  type="button"
                  id="btn-reg-prev-3"
                  onClick={handlePrevStep}
                  className="px-5 py-2 bg-carbon-800 text-carbon-300 font-sans text-xs rounded-xl hover:bg-carbon-750 transition"
                >
                  Anterior
                </button>
                <button
                  type="submit"
                  id="btn-reg-final-submit"
                  disabled={!consentRules || !consentImage || !identityCardChecked}
                  className="px-8 py-2.5 bg-gradient-to-r from-gold-600 to-gold-400 disabled:opacity-50 text-carbon-950 font-sans text-xs font-bold rounded-xl shadow-lg hover:shadow-gold-500/10 cursor-pointer transition uppercase"
                >
                  Submeter Candidatura Oficial
                </button>
              </div>
            </div>
          )}

        </form>
      )}

    </div>
  );
};
