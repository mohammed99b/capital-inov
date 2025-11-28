import { axiosClient } from './axiosClient';
import { Achat } from '../types';

export const getAchats = async (params?: any) => {
  const { data } = await axiosClient.get<Achat[]>('/achats/', { params });
  return data;
};

export const createAchat = async (achat: Partial<Achat>) => {
  const { data } = await axiosClient.post<Achat>('/achats/', achat);
  return data;
};

export const updateAchat = async (id: string, achat: Partial<Achat>) => {
  const { data } = await axiosClient.put<Achat>(`/achats/${id}/`, achat);
  return data;
};

export const deleteAchat = async (id: string) => {
  await axiosClient.delete(`/achats/${id}/`);
};
