import { api } from "@/utils/api";
import { VITE_API_URL } from "@/utils/config";

const path = "/projects";

export interface ProjectData {
  id: string;
  name: string;
  dubbing_id: string;
  status: string;
  source_lang: string;
  original_target_lang: string;
  target_languages: string[];
}

export const getAllProjects = async () => {
  return (await api.get(path)).data as ProjectData[];
};

export const getProject = async (id: string) => {
  return (await api.get(`${path}/${id}`)).data as ProjectData;
};

export const getStreamUrl = (id: string) => {
  return `http://127.0.0.1:5000${path}/${id}/video`;
};

export const getAudioUrl = (id: string, lang: string) => {
  return `http://127.0.0.1:5000${path}/${id}/audio/${lang}.mp3`;
};

export const addProject = async (
  source_lang: string,
  target_lang: string,
  file: File
) => {
  const formData = new FormData();
  formData.append("source_lang", source_lang);
  formData.append("target_lang", target_lang);
  formData.append("file", file);

  const response = await api.postForm(path, formData);

  return response.data.id;
};
