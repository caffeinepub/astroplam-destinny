import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import type { BlogPost, Inquiry, Service, UserProfile } from "../types/index";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export type { BlogPost } from "../types/index";
export type { Inquiry } from "../types/index";

export function useGetServices() {
  const { actor, isFetching } = useActor();
  return useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getServices();
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useGetAllPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<BlogPost[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllPosts();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 2,
  });
}

export function useGetAllPostsAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<BlogPost[]>({
    queryKey: ["postsAdmin"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllPostsAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 1000 * 60,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      content,
      author,
    }: { title: string; content: string; author: string }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).createPost(title, content, author);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["postsAdmin"] });
    },
  });
}

export function useUpdatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      content,
      author,
    }: { id: string; title: string; content: string; author: string }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).updatePost(id, title, content, author);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["postsAdmin"] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).deletePost(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["postsAdmin"] });
    },
  });
}

export function usePublishPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).publishPost(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["postsAdmin"] });
    },
  });
}

export function useGetAllInquiries() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["inquiries"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllInquiries();
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 1000 * 60,
  });
}

export function useSubmitInquiry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      serviceId,
      visitorName,
      dob,
      tob,
      question,
      pastLifeNotes,
      handPictureFile,
      palmPhotoFiles,
      onProgress,
      relationshipPerson2Name,
      relationshipPerson2Dob,
      relationshipPerson2Tob,
      state,
      birthCountry,
      city,
      seedNumber,
    }: {
      serviceId: bigint;
      visitorName: string;
      dob: string;
      tob: string;
      question: string;
      pastLifeNotes: string;
      handPictureFile: File | null;
      palmPhotoFiles?: File[];
      onProgress?: (pct: number) => void;
      relationshipPerson2Name: string | null;
      relationshipPerson2Dob: string | null;
      relationshipPerson2Tob: string | null;
      state: string | null;
      birthCountry: string | null;
      city: string | null;
      seedNumber?: bigint | null;
    }) => {
      if (!actor) throw new Error("Actor not available");

      let handBlob: ExternalBlob | undefined = undefined;
      if (handPictureFile) {
        const bytes = new Uint8Array(await handPictureFile.arrayBuffer());
        let blob = ExternalBlob.fromBytes(bytes);
        if (onProgress) {
          blob = blob.withUploadProgress(onProgress);
        }
        handBlob = blob;
      }

      const palmPhotoBlobs: Array<ExternalBlob | null> = [];
      if (palmPhotoFiles && palmPhotoFiles.length > 0) {
        const totalFiles = palmPhotoFiles.length;
        for (let i = 0; i < totalFiles; i++) {
          const file = palmPhotoFiles[i];
          const bytes = new Uint8Array(await file.arrayBuffer());
          let blob: ExternalBlob = ExternalBlob.fromBytes(bytes);
          if (onProgress) {
            const fileIndex = i;
            blob = blob.withUploadProgress((pct) => {
              const overall = Math.round(
                ((fileIndex + pct / 100) / totalFiles) * 100,
              );
              onProgress(overall);
            });
          }
          palmPhotoBlobs.push(blob);
        }
      }

      const person2 = relationshipPerson2Name
        ? {
            name: relationshipPerson2Name,
            dob: relationshipPerson2Dob ?? undefined,
            tob: relationshipPerson2Tob ?? undefined,
          }
        : undefined;

      return (actor as any).submitInquiry({
        id: "",
        serviceId,
        visitorName,
        dob: dob || undefined,
        tob: tob || undefined,
        question,
        pastLifeNotes,
        handPicture: handBlob,
        palmPhotos: palmPhotoBlobs,
        city: city ?? undefined,
        state: state ?? undefined,
        birthCountry: birthCountry ?? undefined,
        seedNumber: seedNumber ?? undefined,
        relationshipPerson2: person2,
        submittedAt: BigInt(0),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
    },
  });
}

export function useDeleteInquiry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).deleteInquiry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
    },
  });
}

export function useCheckAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<boolean>({
    queryKey: ["isAdmin", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      return (actor as any).isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useSubmitVisitorQuery() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      contactInfo,
      message,
    }: { name: string; contactInfo: string; message: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).submitVisitorQuery(name, contactInfo, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitor_queries"] });
    },
  });
}

export function useGetVisitorQueries() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["visitor_queries"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getVisitorQueries?.() ?? [];
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 1000 * 60,
  });
}
