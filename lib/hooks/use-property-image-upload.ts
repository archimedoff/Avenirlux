"use client";

import { useCallback, useState } from "react";

export type UploadQueueItem = {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
};

type UploadState = {
  queue: UploadQueueItem[];
  error: string | null;
};

function uploadWithProgress(
  file: File,
  propertyId: string | undefined,
  onProgress: (pct: number) => void,
): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append("file", file);
    if (propertyId) form.append("propertyId", propertyId);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener("load", () => {
      try {
        const data = JSON.parse(xhr.responseText) as { url?: string; error?: string; hint?: string };
        if (xhr.status >= 200 && xhr.status < 300 && data.url) {
          resolve({ url: data.url });
        } else {
          reject(new Error(data.hint ? `${data.error}. ${data.hint}` : data.error || "Upload failed"));
        }
      } catch {
        reject(new Error("Upload failed"));
      }
    });
    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.open("POST", "/api/host/uploads");
    xhr.send(form);
  });
}

export function usePropertyImageUpload(propertyId?: string) {
  const [state, setState] = useState<UploadState>({ queue: [], error: null });

  const uploading = state.queue.some((q) => q.status === "uploading");

  const uploadFile = useCallback(
    async (file: File): Promise<string | null> => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setState((s) => ({
        queue: [...s.queue, { id, name: file.name, progress: 0, status: "uploading" }],
        error: null,
      }));

      try {
        const { url } = await uploadWithProgress(file, propertyId, (progress) => {
          setState((s) => ({
            ...s,
            queue: s.queue.map((q) => (q.id === id ? { ...q, progress } : q)),
          }));
        });
        setState((s) => ({
          queue: s.queue.map((q) => (q.id === id ? { ...q, progress: 100, status: "done" } : q)),
          error: null,
        }));
        setTimeout(() => {
          setState((s) => ({ ...s, queue: s.queue.filter((q) => q.id !== id) }));
        }, 1200);
        return url;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Upload failed";
        setState((s) => ({
          queue: s.queue.map((q) => (q.id === id ? { ...q, status: "error", error: msg } : q)),
          error: msg,
        }));
        return null;
      }
    },
    [propertyId],
  );

  const clearQueue = useCallback(() => {
    setState((s) => ({ ...s, queue: s.queue.filter((q) => q.status === "uploading") }));
  }, []);

  return { uploadFile, uploading, error: state.error, queue: state.queue, clearQueue };
}

export async function fetchStorageConfigured(): Promise<boolean> {
  try {
    const res = await fetch("/api/host/uploads");
    const data = await res.json();
    return Boolean(data.configured);
  } catch {
    return false;
  }
}
