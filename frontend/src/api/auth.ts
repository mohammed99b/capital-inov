import { axiosClient } from './axiosClient';
import { AuthResponse, User } from '../types';

export const login = async (credentials: { username: string; password: string; email?: string }) => {
  // SimpleJWT typically uses 'username' and 'password'
  // We map email to username for the backend if needed, or backend handles email as username
  const payload = { ...credentials, username: credentials.email || credentials.username };
  const { data } = await axiosClient.post<AuthResponse>('/auth/login/', payload);
  return data;
};

export const register = async (data: { 
  company_name: string; 
  first_name: string; 
  last_name: string; 
  email: string; 
  password: string 
}) => {
  const response = await axiosClient.post('/auth/register/', data);
  return response.data;
};

export const getMe = async () => {
  const { data } = await axiosClient.get<User>('/auth/me/');
  return data;
};
