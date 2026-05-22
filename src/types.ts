/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Candidate {
  id: string;
  fullName: string;
  stageName: string;
  birthDate: string;
  age: number;
  nationality: string;
  province: string;
  biography: string;
  story: string;
  motivation: string;
  category: string;
  height: number; // in cm
  weight: number; // in kg
  talents: string[];
  experience: string;
  profilePhoto: string;
  bodyPhoto: string;
  albumPhotos: string[];
  presentationVideo?: string;
  walkVideo?: string;
  talentVideo?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  votesCount: number;
  viewsCount: number;
  juryScore: number; // Average score (1.0 to 10.0)
  active: boolean;
  dailyVotesChange: number; // For ranking change indicators (e.g., +3 positions or -2 positions)
}

export interface Voter {
  id: string;
  username: string;
  email: string;
  freeVoteAvailable: boolean;
  lastVotedAt?: string;
  role: 'public' | 'jury' | 'admin';
}

export interface JuryEvaluation {
  id: string;
  candidateId: string;
  juryId: string;
  juryName: string;
  communication: number; // 1-10
  presence: number; // 1-10
  confidence: number; // 1-10
  runway: number; // 1-10
  talent: number; // 1-10
  comment: string;
  createdAt: string;
}

export interface VoteTransaction {
  id: string;
  candidateId: string;
  candidateName: string;
  voterName: string;
  voterEmail: string;
  votesQuantity: number;
  paymentMethod: 'mpesa' | 'emola' | 'mkesh' | 'visa';
  phoneNumber?: string; // For mobile money (+258 ...)
  amountMZN: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface SystemSettings {
  contestEdition: string; // e.g., "Edição 2026"
  activeStage: 'enrollment' | 'selection' | 'public_voting' | 'jury_voting' | 'grand_final';
  juryVoteWeight: number; // e.g., 50 for 50%
  publicVoteWeight: number; // e.g., 50 for 50%
  voterDailyLimit: number; // Max free votes per day (e.g., 1)
  paidVotePriceMZN: number; // Price per single vote in meticais (e.g., 10 MZN)
  allowPublicVoting: boolean;
  allowJuryVoting: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}
