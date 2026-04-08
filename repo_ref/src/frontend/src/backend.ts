/* eslint-disable */

// @ts-nocheck

import { Actor, HttpAgent, type HttpAgentOptions, type ActorConfig, type Agent, type ActorSubclass } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import { idlFactory, type _SERVICE } from "./declarations/backend.did";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    _blob?: Uint8Array<ArrayBuffer> | null;
    directURL: string;
    onProgress?: (percentage: number) => void = undefined;
    private constructor(directURL: string, blob: Uint8Array<ArrayBuffer> | null){
        if (blob) {
            this._blob = blob;
        }
        this.directURL = directURL;
    }
    static fromURL(url: string): ExternalBlob {
        return new ExternalBlob(url, null);
    }
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob {
        const url = URL.createObjectURL(new Blob([
            new Uint8Array(blob)
        ], {
            type: 'application/octet-stream'
        }));
        return new ExternalBlob(url, blob);
    }
    public async getBytes(): Promise<Uint8Array<ArrayBuffer>> {
        if (this._blob) {
            return this._blob;
        }
        const response = await fetch(this.directURL);
        const blob = await response.blob();
        this._blob = new Uint8Array(await blob.arrayBuffer());
        return this._blob;
    }
    public getDirectURL(): string {
        return this.directURL;
    }
    public withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
        this.onProgress = onProgress;
        return this;
    }
}
export interface backendInterface {
}
export class Backend implements backendInterface {
    private _actor: ActorSubclass<_SERVICE>;
    private _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>;
    private _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>;
    private _processError?: (error: unknown) => never;

    constructor(
        actor: ActorSubclass<_SERVICE>,
        uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
        downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
        processError?: (error: unknown) => never
    ) {
        this._actor = actor;
        this._uploadFile = uploadFile;
        this._downloadFile = downloadFile;
        this._processError = processError;

        // Proxy all actor methods onto this instance
        const self = this;
        return new Proxy(this, {
            get(target, prop, receiver) {
                // Special handling for submitInquiry to process ExternalBlob
                if (prop === 'submitInquiry') {
                    return async (inquiry: any) => {
                        // Upload handPicture if present
                        let handPicture: [Uint8Array] | [] = [];
                        if (inquiry.handPicture instanceof ExternalBlob) {
                            const bytes = await self._uploadFile(inquiry.handPicture);
                            handPicture = [bytes];
                        } else if (inquiry.handPicture) {
                            handPicture = [inquiry.handPicture];
                        }

                        // Upload palmPhotos
                        const palmPhotos: ([Uint8Array] | [])[] = [];
                        if (Array.isArray(inquiry.palmPhotos)) {
                            for (const photo of inquiry.palmPhotos) {
                                if (photo instanceof ExternalBlob) {
                                    const bytes = await self._uploadFile(photo);
                                    palmPhotos.push([bytes]);
                                } else if (photo) {
                                    palmPhotos.push([photo]);
                                } else {
                                    palmPhotos.push([]);
                                }
                            }
                        }

                        const candid = {
                            ...inquiry,
                            handPicture,
                            palmPhotos,
                            dob: inquiry.dob ? [inquiry.dob] : [],
                            tob: inquiry.tob ? [inquiry.tob] : [],
                            birthCountry: inquiry.birthCountry ? [inquiry.birthCountry] : [],
                            city: inquiry.city ? [inquiry.city] : [],
                            state: inquiry.state ? [inquiry.state] : [],
                            seedNumber: inquiry.seedNumber != null ? [inquiry.seedNumber] : [],
                            authorId: inquiry.authorId ? [inquiry.authorId] : [],
                            relationshipPerson2: inquiry.relationshipPerson2
                                ? [{
                                    name: inquiry.relationshipPerson2.name,
                                    dob: inquiry.relationshipPerson2.dob ? [inquiry.relationshipPerson2.dob] : [],
                                    tob: inquiry.relationshipPerson2.tob ? [inquiry.relationshipPerson2.tob] : [],
                                  }]
                                : [],
                            serviceId: BigInt(inquiry.serviceId),
                        };
                        return (self._actor as any).submitInquiry(candid);
                    };
                }

                // getAllInquiries: decode ExternalBlob fields from responses
                if (prop === 'getAllInquiries') {
                    return async () => {
                        const results = await (self._actor as any).getAllInquiries();
                        return results.map((inq: any) => ({
                            ...inq,
                            dob: inq.dob?.[0] ?? undefined,
                            tob: inq.tob?.[0] ?? undefined,
                            birthCountry: inq.birthCountry?.[0] ?? undefined,
                            city: inq.city?.[0] ?? undefined,
                            state: inq.state?.[0] ?? undefined,
                            seedNumber: inq.seedNumber?.[0] ?? undefined,
                            authorId: inq.authorId?.[0] ?? undefined,
                            handPicture: inq.handPicture?.[0]
                                ? ExternalBlob.fromBytes(inq.handPicture[0])
                                : undefined,
                            palmPhotos: (inq.palmPhotos ?? []).map((p: any) =>
                                p?.[0] ? ExternalBlob.fromBytes(p[0]) : null
                            ),
                            relationshipPerson2: inq.relationshipPerson2?.[0]
                                ? {
                                    name: inq.relationshipPerson2[0].name,
                                    dob: inq.relationshipPerson2[0].dob?.[0] ?? undefined,
                                    tob: inq.relationshipPerson2[0].tob?.[0] ?? undefined,
                                  }
                                : undefined,
                        }));
                    };
                }

                // getCallerUserProfile: unwrap option
                if (prop === 'getCallerUserProfile') {
                    return async () => {
                        const result = await (self._actor as any).getCallerUserProfile();
                        return result?.[0] ?? null;
                    };
                }

                // getUserProfile: unwrap option
                if (prop === 'getUserProfile') {
                    return async (principal: any) => {
                        const result = await (self._actor as any).getUserProfile(principal);
                        return result?.[0] ?? null;
                    };
                }

                // visitorLoginByEmail: unwrap option
                if (prop === 'visitorLoginByEmail') {
                    return async (email: string, password: string) => {
                        const result = await (self._actor as any).visitorLoginByEmail(email, password);
                        return result?.[0] ?? null;
                    };
                }

                // saveCallerUserProfile: wrap fields
                if (prop === 'saveCallerUserProfile') {
                    return async (profile: any) => {
                        return (self._actor as any).saveCallerUserProfile(profile);
                    };
                }

                // Own properties first
                if (prop in target) {
                    const val = Reflect.get(target, prop, receiver);
                    return val;
                }

                // Forward to underlying actor
                const method = (self._actor as any)[prop];
                if (typeof method === 'function') {
                    return method.bind(self._actor);
                }
                return method;
            }
        }) as any;
    }
}
export interface CreateActorOptions {
    agent?: Agent;
    agentOptions?: HttpAgentOptions;
    actorOptions?: ActorConfig;
    processError?: (error: unknown) => never;
}
export function createActor(canisterId: string, _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>, _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>, options: CreateActorOptions = {}): Backend {
    const agent = options.agent || HttpAgent.createSync({
        ...options.agentOptions
    });
    if (options.agent && options.agentOptions) {
        console.warn("Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent.");
    }
    const actor = Actor.createActor<_SERVICE>(idlFactory, {
        agent,
        canisterId: canisterId,
        ...options.actorOptions
    });
    return new Backend(actor, _uploadFile, _downloadFile, options.processError);
}
