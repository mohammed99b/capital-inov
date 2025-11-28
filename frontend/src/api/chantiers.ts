import { axiosClient } from './axiosClient';
import { Chantier } from '../types';

export const getChantiers = async (params?: any) => {
  const { data } = await axiosClient.get<Chantier[]>('/chantiers/', { params });
  return data;
};

export const createChantier = async (chantier: Partial<Chantier>) => {
  const { data } = await axiosClient.post<Chantier>('/chantiers/', chantier);
  return data;
};

export const updateChantier = async (id: string, chantier: Partial<Chantier>) => {
  const { data } = await axiosClient.put<Chantier>(`/chantiers/${id}/`, chantier);
  return data;
};

export const deleteChantier = async (id: string) => {
  await axiosClient.delete(`/chantiers/${id}/`);
};
