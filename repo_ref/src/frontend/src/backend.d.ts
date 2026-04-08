import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
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
export type Timestamp = bigint;
export interface Service {
    id: bigint;
    name: string;
    price: bigint;
}
export interface Notice {
    id: string;
    title: string;
    active: boolean;
    createdAt: Timestamp;
    message: string;
}
export interface Inquiry {
    id: string;
    dob?: string;
    tob?: string;
    palmPhotos: Array<ExternalBlob | null>;
    question: string;
    authorId?: Principal;
    seedNumber?: bigint;
    city?: string;
    submittedAt: Timestamp;
    birthCountry?: string;
    handPicture?: ExternalBlob;
    state?: string;
    visitorName: string;
    pastLifeNotes: string;
    serviceId: bigint;
    relationshipPerson2?: Person;
}
export interface NumerologyUser {
    username: string;
    passwordHash: string;
    sectionLevel: bigint;
}
export interface Person {
    dob?: string;
    tob?: string;
    name: string;
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPost(title: string, content: string, author: string): Promise<string>;
    deleteInquiry(id: string): Promise<void>;
    deletePost(id: string): Promise<void>;
    getAllInquiries(): Promise<Array<Inquiry>>;
    getAllPosts(): Promise<Array<BlogPost>>;
    getAllPostsAdmin(): Promise<Array<BlogPost>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getServices(): Promise<Array<Service>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    noticeCreate(adminEmail: string, adminPassword: string, title: string, message: string): Promise<string>;
    noticeDelete(adminEmail: string, adminPassword: string, id: string): Promise<void>;
    noticeList(): Promise<Array<Notice>>;
    noticeListAll(adminEmail: string, adminPassword: string): Promise<Array<Notice>>;
    noticeToggleActive(adminEmail: string, adminPassword: string, id: string): Promise<void>;
    numerologyCreateUser(adminUsername: string, adminPassword: string, username: string, password: string, sectionLevel: bigint): Promise<void>;
    numerologyDeleteUser(adminUsername: string, adminPassword: string, username: string): Promise<void>;
    numerologyListUsers(adminUsername: string, adminPassword: string): Promise<Array<NumerologyUser>>;
    numerologyLogin(username: string, password: string): Promise<bigint>;
    publishPost(id: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitInquiry(inquiry: Inquiry): Promise<string>;
    submitVisitorQuery(name: string, contactInfo: string, message: string): Promise<void>;
    updatePost(id: string, title: string, content: string, author: string): Promise<void>;
    visitorCreateId(adminEmail: string, adminPassword: string, service: string, visitorName: string, username: string, password: string, expiryDays: bigint): Promise<void>;
    visitorDeleteId(adminEmail: string, adminPassword: string, username: string): Promise<void>;
    visitorListIds(adminEmail: string, adminPassword: string): Promise<Array<VisitorID>>;
    visitorLoginByEmail(email: string, password: string): Promise<{service: string; visitorName: string} | null>;
    visitorValidateId(service: string, username: string, password: string): Promise<boolean>;
    adminCreateVisitorId(adminEmail: string, adminPassword: string, service: string, visitorName: string, username: string, password: string, expiryDays: bigint): Promise<void>;
    adminListVisitorIds(adminEmail: string, adminPassword: string): Promise<Array<VisitorID>>;
    adminDeleteVisitorId(adminEmail: string, adminPassword: string, username: string): Promise<void>;
    openCreateVisitorId(service: string, visitorName: string, username: string, password: string, expiryDays: bigint): Promise<void>;
    openListVisitorIds(): Promise<Array<VisitorID>>;
    openDeleteVisitorId(username: string): Promise<void>;
    adminGetAllPosts(adminEmail: string, adminPassword: string): Promise<Array<BlogPost>>;
    adminCreatePost(adminEmail: string, adminPassword: string, title: string, content: string, author: string): Promise<string>;
    adminUpdatePost(adminEmail: string, adminPassword: string, id: string, title: string, content: string, author: string): Promise<void>;
    adminDeletePost(adminEmail: string, adminPassword: string, id: string): Promise<void>;
    adminPublishPost(adminEmail: string, adminPassword: string, id: string): Promise<void>;
    adminGetVisitorQueries(adminEmail: string, adminPassword: string): Promise<Array<VisitorQuery>>;
    adminCreateNotice(adminEmail: string, adminPassword: string, title: string, message: string): Promise<string>;
    adminListNotices(adminEmail: string, adminPassword: string): Promise<Array<Notice>>;
    adminDeleteNotice(adminEmail: string, adminPassword: string, id: string): Promise<void>;
    adminToggleNotice(adminEmail: string, adminPassword: string, id: string): Promise<void>;
    serviceSetPublic(adminEmail: string, adminPassword: string, service: string, isPublic: boolean): Promise<void>;
    serviceIsPublic(service: string): Promise<boolean>;
    getVisitorQueries(): Promise<Array<VisitorQuery>>;
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
}
