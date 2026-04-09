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
export type Timestamp = bigint;
export interface Service {
    id: bigint;
    name: string;
    price: bigint;
}
export interface NadiPlanetInfo {
    subLord: string;
    isRetrograde: boolean;
    name: string;
    pada: bigint;
    sign: string;
    degree: number;
    nakLord: string;
    houseNum: bigint;
    degreeStr: string;
    nakshatra: string;
}
export interface NadiChartResult {
    dashaBalance: string;
    planets: Array<NadiPlanetInfo>;
    ascendant: NadiPlanetInfo;
}
export interface Notice {
    id: string;
    title: string;
    active: boolean;
    createdAt: Timestamp;
    message: string;
}
export interface VisitorQuery {
    contactInfo: string;
    name: string;
    submittedAt: Timestamp;
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
export interface UserProfile {
    id: Principal;
    name: string;
    createdAt: Timestamp;
    email: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminCreateNotice(adminEmail: string, adminPassword: string, title: string, message: string): Promise<string>;
    adminCreatePost(adminEmail: string, adminPassword: string, title: string, content: string, author: string): Promise<string>;
    adminCreateVisitorId(adminEmail: string, adminPassword: string, service: string, visitorName: string, username: string, password: string, expiryDays: bigint): Promise<void>;
    adminDeleteNotice(adminEmail: string, adminPassword: string, id: string): Promise<void>;
    adminDeletePost(adminEmail: string, adminPassword: string, id: string): Promise<void>;
    adminDeleteVisitorId(adminEmail: string, adminPassword: string, username: string): Promise<void>;
    adminGetAllPosts(adminEmail: string, adminPassword: string): Promise<Array<BlogPost>>;
    adminGetVisitorQueries(adminEmail: string, adminPassword: string): Promise<Array<VisitorQuery>>;
    adminListNotices(adminEmail: string, adminPassword: string): Promise<Array<Notice>>;
    adminListVisitorIds(adminEmail: string, adminPassword: string): Promise<Array<VisitorID>>;
    adminPublishPost(adminEmail: string, adminPassword: string, id: string): Promise<void>;
    adminToggleNotice(adminEmail: string, adminPassword: string, id: string): Promise<void>;
    adminUpdatePost(adminEmail: string, adminPassword: string, id: string, title: string, content: string, author: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calculateNadiPlanets(dateStr: string, timeStr: string, lat: number, lon: number): Promise<{
        __kind__: "ok";
        ok: NadiChartResult;
    } | {
        __kind__: "err";
        err: string;
    }>;
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
    getVisitorQueries(): Promise<Array<VisitorQuery>>;
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
    openCreateVisitorId(service: string, visitorName: string, username: string, password: string, expiryDays: bigint): Promise<void>;
    openDeleteVisitorId(username: string): Promise<void>;
    openListVisitorIds(): Promise<Array<VisitorID>>;
    publishPost(id: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    serviceGetAllAccess(adminEmail: string, adminPassword: string): Promise<Array<[string, boolean]>>;
    serviceIsPublic(service: string): Promise<boolean>;
    serviceSetPublic(adminEmail: string, adminPassword: string, service: string, isPublic: boolean): Promise<void>;
    submitInquiry(inquiry: Inquiry): Promise<string>;
    submitVisitorQuery(name: string, contactInfo: string, message: string): Promise<void>;
    updatePost(id: string, title: string, content: string, author: string): Promise<void>;
    visitorCreateId(adminEmail: string, adminPassword: string, service: string, visitorName: string, username: string, password: string, expiryDays: bigint): Promise<void>;
    visitorDeleteId(adminEmail: string, adminPassword: string, username: string): Promise<void>;
    visitorListIds(adminEmail: string, adminPassword: string): Promise<Array<VisitorID>>;
    visitorLoginByEmail(email: string, password: string): Promise<{
        service: string;
        visitorName: string;
    } | null>;
    visitorValidateId(service: string, username: string, password: string): Promise<boolean>;
}
