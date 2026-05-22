/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Candidate, Voter, SystemSettings, JuryEvaluation, VoteTransaction } from '../types';

export const MOZAMBIQUE_PROVINCES = [
  'Maputo Cidade',
  'Maputo Província',
  'Gaza',
  'Inhambane',
  'Sofala',
  'Manica',
  'Tete',
  'Zambézia',
  'Nampula',
  'Cabo Delgado',
  'Niassa'
];

export const CONTEST_CATEGORIES = [
  'Miss Moçambique (Sénior)',
  'Miss Teen Moçambique',
  'Miss Pérola Moçambique (Cultural/Talento)'
];

export const INITIAL_SETTINGS: SystemSettings = {
  contestEdition: 'Edição Miss Moçambique 2026',
  activeStage: 'public_voting', // Phases: enrollment | selection | public_voting | jury_voting | grand_final
  juryVoteWeight: 50,
  publicVoteWeight: 50,
  voterDailyLimit: 1,
  paidVotePriceMZN: 10,
  allowPublicVoting: true,
  allowJuryVoting: true
};

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    fullName: 'Amara Vanessa da Silva',
    stageName: 'Amara Silva',
    birthDate: '2002-09-14',
    age: 23,
    nationality: 'Moçambicana',
    province: 'Maputo Cidade',
    biography: 'Nascida e criada na movimentada capital Maputo, Amara é licenciada em Relações Internacionais e Empreendedora Social. É apaixonada por literatura, poesia moçambicana e design sustentável.',
    story: 'Amara iniciou projetos sociais aos 19 anos. Ela co-fundou a iniciativa "Mulher Digital", que fornece formação em informática corporativa e competências digitais básicas para jovens raparigas em distritos periféricos de Maputo e Gaza, capacitando e melhorando a empregabilidade.',
    motivation: 'Ser coroada Miss Moçambique representa para mim a plataforma ideal de engajamento multilateral. Quero promover parcerias internacionais para infraestruturas educativas rurais e redefinir o papel social e transformador de uma Rainha de Beleza no século XXI.',
    category: 'Miss Moçambique (Sénior)',
    height: 178,
    weight: 56,
    talents: ['Dança Tradicional Moçambicana', 'Oratória Pública', 'Liderança Social'],
    experience: 'Elite Model Look Mozambique 2024 (Representante nacional); Modelo principal no Maputo Fashion Week (2023, 2024).',
    profilePhoto: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=600&auto=format&fit=crop',
    bodyPhoto: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop',
    albumPhotos: [
      'https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop'
    ],
    presentationVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    walkVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    talentVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    status: 'approved',
    createdAt: '2026-03-10T10:30:00Z',
    votesCount: 1450,
    viewsCount: 4890,
    juryScore: 9.1,
    active: true,
    dailyVotesChange: 2
  },
  {
    id: 'cand-2',
    fullName: 'Yasmine Jamila Mendes',
    stageName: 'Yasmine Mendes',
    birthDate: '2004-04-18',
    age: 22,
    nationality: 'Moçambicana',
    province: 'Nampula',
    biography: 'Orgulhosamente nascida na terra do caju, Nampula, Yasmine é estudante do 5º ano de Medicina Geral e activista contra a exclusão social de raparigas de zonas rurais no acesso à saúde.',
    story: 'Crescendo no interior de Nampula, Yasmine testemunhou a bravura das parteiras tradicionais. Ela foca seu trabalho voluntário na tradução e disseminação de literacia em saúde materna para os idiomas locais Macua e Sena nas comunidades do interior do norte de Moçambique.',
    motivation: 'A coroa nacional é um megafone para a saúde preventiva. Quero provar que a Miss pode ser uma ponte dinâmica e confiável entre campanhas médicas globais e as necessidades reais nas aldeias moçambicanas.',
    category: 'Miss Moçambique (Sénior)',
    height: 175,
    weight: 54,
    talents: ['Canto Acústico', 'Língua Macua Fluente', 'Palestra Sanitária'],
    experience: 'Participante do Nampula Fashion Awards 2024; Miss Estudantil Provincial.',
    profilePhoto: 'https://images.unsplash.com/photo-1567186937675-a5131c8a89ea?q=80&w=600&auto=format&fit=crop',
    bodyPhoto: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=600&auto=format&fit=crop',
    albumPhotos: [
      'https://images.unsplash.com/photo-1567186937675-a5131c8a89ea?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop'
    ],
    presentationVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    walkVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    status: 'approved',
    createdAt: '2026-03-12T14:20:00Z',
    votesCount: 1320,
    viewsCount: 3950,
    juryScore: 8.7,
    active: true,
    dailyVotesChange: -1
  },
  {
    id: 'cand-3',
    fullName: 'Naila Neusa Matsinhe',
    stageName: 'Naila Matsinhe',
    birthDate: '2001-11-28',
    age: 24,
    nationality: 'Moçambicana',
    province: 'Sofala',
    biography: 'De Beira, Sofala, Naila é licenciada em Engenharia Florestal e activa defensora da conservação costeira e restauração de mangais.',
    story: 'No rescaldo de ciclones históricos na Beira, Naila juntou-se a 20 estudantes voluntários para replantar mais de 3.000 pés de mangal costeiro na foz do Rio Chiveve. Ela promove palestras ecológicas de reciclagem de plásticos para evitar a asfixia marinha.',
    motivation: 'A beleza ecológica é o coração do meu concurso. Quero elevar Sofala e as problemáticas da crise climática moçambicana a palcos que inspirem acções urgentes de investidores ecológicos internacionais.',
    category: 'Miss Moçambique (Sénior)',
    height: 180,
    weight: 58,
    talents: ['Poesia Falada', 'Passarela Dramática', 'Pintura a Acrílico'],
    experience: 'Modelo da Passarela Beira Fashion Week (2021-2024); Embaixadora do Clima Jovem Beira.',
    profilePhoto: 'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?q=80&w=600&auto=format&fit=crop',
    bodyPhoto: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=600&auto=format&fit=crop',
    albumPhotos: [
      'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop'
    ],
    presentationVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    walkVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    status: 'approved',
    createdAt: '2026-03-15T09:12:00Z',
    votesCount: 1540,
    viewsCount: 5120,
    juryScore: 9.4,
    active: true,
    dailyVotesChange: 3
  },
  {
    id: 'cand-4',
    fullName: 'Kiara Estefânia Langa',
    stageName: 'Kiara Langa',
    birthDate: '2008-01-05',
    age: 18,
    nationality: 'Moçambicana',
    province: 'Gaza',
    biography: 'Com origens nas praias brancas do Bilene, em Gaza, Kiara tem 18 anos, estuda Informática Geral e actua no incentivo de raparigas estudantes no ensino secundário público para áreas tecnológicas.',
    story: 'Kiara organiza círculos de mentoria em Xai-Xai chamados "Raparigas do Futuro", onde ensina matemática pré-universitária e conceitos básicos de lógica de programação utilizando computadores reutilizados e doados por escolas técnicas.',
    motivation: 'A categoria Miss Teen representa o pioneirismo das novas gerações moçambicanas. Quero ser um farol de autoconfiança, mostrando que inteligência lógica e sensibilidade artística andam de mãos dadas.',
    category: 'Miss Teen Moçambique',
    height: 172,
    weight: 51,
    talents: ['Dança Contemporânea Afro-House', 'Fluência em Changana', 'Recitação Literária'],
    experience: 'Vencedora do Miss Escola Secundária Gaza 2024; Primeira Princesa Rainha do Bilene 2025.',
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    bodyPhoto: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=600&auto=format&fit=crop',
    albumPhotos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=600&auto=format&fit=crop'
    ],
    presentationVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    status: 'approved',
    createdAt: '2026-03-20T11:45:00Z',
    votesCount: 910,
    viewsCount: 2800,
    juryScore: 8.3,
    active: true,
    dailyVotesChange: 1
  },
  {
    id: 'cand-5',
    fullName: 'Samira Amina Momade',
    stageName: 'Samira Momade',
    birthDate: '2003-05-30',
    age: 23,
    nationality: 'Moçambicana',
    province: 'Cabo Delgado',
    biography: 'Nascida em Pemba, Cabo Delgado, Samira é licenciada em Engenharia Alimentar e activista comunitária. Fundou uma associação que apoia mulheres deslocadas na produção sustentável de micro-culturas marinhas.',
    story: 'No seu trabalho associativo em Pemba, Samira ensinou mais de 45 mulheres e mães a cultivar e processar algas e marisco locais em farinha suplementar de alto teor proteico, combatendo activamente a subnutrição infantil da região.',
    motivation: 'Cabo Delgado possui mentes fantásticas e uma arte magnífica da capulana e da madeira esculpida. Quero levar ao palco do Miss Moçambique o dinamismo industrial, a dignidade feminina de resistência e o brilho inigualável da nossa província do norte.',
    category: 'Miss Moçambique (Sénior)',
    height: 181,
    weight: 57,
    talents: ['Penteado e Turbantes de Capulana', 'Teatro Expressivo', 'Debate Académico'],
    experience: 'Modelo de marcas moçambicanas de moda tradicional; Campeã na feira agrônoma de inovação juvenil.',
    profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
    bodyPhoto: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop',
    albumPhotos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=600&auto=format&fit=crop'
    ],
    presentationVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    walkVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    talentVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    status: 'approved',
    createdAt: '2026-03-24T10:05:00Z',
    votesCount: 1410,
    viewsCount: 4120,
    juryScore: 9.0,
    active: true,
    dailyVotesChange: -2
  },
  {
    id: 'cand-6',
    fullName: 'Zuri Abigail Tembe',
    stageName: 'Zuri Tembe',
    birthDate: '2005-02-14',
    age: 21,
    nationality: 'Moçambicana',
    province: 'Inhambane',
    biography: 'Originária da terra das boas gentes, Inhambane, Zuri é dançarina clássica tradicional e estudante do curso de História e Antropologia Cultural Africana, focando nas lendas Chope.',
    story: 'Zuri lidera oficinas semanais na Biblioteca Pública de Inhambane ensinando crianças a tocar Timbila (Patrimônio Cultural Imaterial da UNESCO) e narrar provérbios éticos tradicionais moçambicanos que correm risco de esquecimento.',
    motivation: 'A cultura é o farol que nos norteia. Quero vencer a categoria Miss Pérola Moçambique para modernizar os canais de divulgação das nossas artes cénicas tradicionais no TikTok e YouTube, criando um arquivo digital vivo.',
    category: 'Miss Pérola Moçambique (Cultural/Talento)',
    height: 176,
    weight: 53,
    talents: ['Tofas e Dança Nyau', 'Performance Instrumental com Timbila', 'Escrita Poética'],
    experience: 'Apresentação no Festival da Timbila M’saho (Inharrime); Miss Afro-Simpatia Inhambane.',
    profilePhoto: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=600&auto=format&fit=crop',
    bodyPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop',
    albumPhotos: [
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=600&auto=format&fit=crop'
    ],
    presentationVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    status: 'approved',
    createdAt: '2026-03-27T16:30:00Z',
    votesCount: 840,
    viewsCount: 2200,
    juryScore: 8.5,
    active: true,
    dailyVotesChange: 0
  }
];

export const INITIAL_VOTER: Voter = {
  id: 'voter-test-1',
  username: 'Espectador Moçambique',
  email: 'espectador@miss.gov.mz',
  freeVoteAvailable: true,
  role: 'public'
};

export const INITIAL_JURY: Voter = {
  id: 'jury-test-1',
  username: 'Maria Helena de Lurdes',
  email: 'maria.helena@jurado.org.mz',
  freeVoteAvailable: false,
  role: 'jury'
};

export const INITIAL_ADMIN: Voter = {
  id: 'admin-test-1',
  username: 'Administrador Concurso',
  email: 'admin@missmoçambique.co.mz',
  freeVoteAvailable: false,
  role: 'admin'
};

export const INITIAL_EVALUATIONS: JuryEvaluation[] = [
  {
    id: 'eval-1',
    candidateId: 'cand-1',
    juryId: 'jury-test-1',
    juryName: 'Maria Helena de Lurdes (Ex-Miss)',
    communication: 9,
    presence: 9,
    confidence: 10,
    runway: 9,
    talent: 8,
    comment: 'Excepcional postura diplomática. A sua articulação oral na oratória sobre digitalização rural foi a melhor da noite até agora. Muito elegante no andar.',
    createdAt: '2026-05-10T20:15:00Z'
  },
  {
    id: 'eval-2',
    candidateId: 'cand-3',
    juryId: 'jury-test-1',
    juryName: 'Maria Helena de Lurdes (Ex-Miss)',
    communication: 10,
    presence: 10,
    confidence: 9,
    runway: 10,
    talent: 8,
    comment: 'A passarela da candidata de Sofala é hipnotizante. A poesia falada sobre o renascimento dos solos tocou profundamente todos os jurados.',
    createdAt: '2026-05-11T12:00:00Z'
  }
];

export const INITIAL_TRANSACTIONS: VoteTransaction[] = [
  {
    id: 'tx-1',
    candidateId: 'cand-1',
    candidateName: 'Amara Silva',
    voterName: 'Celso de Maputo',
    voterEmail: 'celso.vota@gmail.com',
    votesQuantity: 50,
    paymentMethod: 'mpesa',
    phoneNumber: '+258 842100344',
    amountMZN: 500,
    status: 'completed',
    createdAt: '2026-05-20T11:15:00Z'
  },
  {
    id: 'tx-2',
    candidateId: 'cand-5',
    candidateName: 'Samira Momade',
    voterName: 'Aline de Cabo Delgado',
    voterEmail: 'aline.pemba@hotmail.com',
    votesQuantity: 200,
    paymentMethod: 'emola',
    phoneNumber: '+258 867700021',
    amountMZN: 2000,
    status: 'completed',
    createdAt: '2026-05-21T09:30:00Z'
  }
];
