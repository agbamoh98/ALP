import { apiClient } from "./axios";
import type { LearningResource } from "../types";

export interface ResourceListItem extends Omit<LearningResource, "content"> {
  characterCount: number;
}

export const resourceApi = {
  uploadPdf: async (file: File, title?: string): Promise<ResourceListItem> => {
    const form = new FormData();
    form.append("file", file);
    if (title) form.append("title", title);
    // Let axios set Content-Type with the correct multipart boundary
    const res = await apiClient.post<ResourceListItem>("/api/resources/upload/pdf", form);
    return res.data;
  },

  uploadText: async (title: string, content: string): Promise<ResourceListItem> => {
    const res = await apiClient.post<ResourceListItem>("/api/resources/upload/text", {
      title,
      content,
    });
    return res.data;
  },

  list: async (): Promise<ResourceListItem[]> => {
    const res = await apiClient.get<ResourceListItem[]>("/api/resources/");
    return res.data;
  },

  get: async (id: string): Promise<LearningResource & { characterCount: number }> => {
    const res = await apiClient.get(`/api/resources/${id}`);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/resources/${id}`);
  },

  count: async (): Promise<number> => {
    const res = await apiClient.get<{ count: number }>("/api/resources/count");
    return res.data.count;
  },
};
