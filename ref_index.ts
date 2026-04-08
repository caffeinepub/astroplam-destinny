import type { Principal } from "@icp-sdk/core/principal";

export type Timestamp = bigint;

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: Timestamp;
  author: string;
}

export interface UserProfile {
  id: Principal;
  name: string;
  createdAt: Timestamp;
  email: string;
}

export interface Service {
  id: bigint;
  name: string;
  price: bigint;
}

export interface Person {
  dob?: string;
  tob?: string;
  name: string;
}

export interface Inquiry {
  id: string;
  dob?: string;
  tob?: string;
  palmPhotos: Array<unknown>;
  question: string;
  authorId?: Principal;
  seedNumber?: bigint;
  city?: string;
  submittedAt: Timestamp;
  birthCountry?: string;
  handPicture?: unknown;
  state?: string;
  visitorName: string;
  pastLifeNotes: string;
  serviceId: bigint;
  relationshipPerson2?: Person;
}

export interface Notice {
  id: string;
  title: string;
  active: boolean;
  createdAt: Timestamp;
  message: string;
}

export interface NumerologyUser {
  username: string;
  passwordHash: string;
  sectionLevel: bigint;
}

export interface VisitorID {
  service: string;
  expiresAt: Timestamp;
  username: string;
  password: string;
  createdAt: Timestamp;
  visitorName: string;
}

export interface VisitorQuery {
  name: string;
  contactInfo: string;
  message: string;
  submittedAt: Timestamp;
}
