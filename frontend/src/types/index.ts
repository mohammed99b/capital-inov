export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'ADMIN' | 'CHEF_CHANTIER';
  tenant: string; // uuid
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface Chantier {
  id: string;
  name: string;
  client: string;
  address: string;
  start_date: string;
  end_date?: string;
  budget: string | number;
  status: 'en_cours' | 'termine' | 'en_pause';
  created_at: string;
}

export interface Achat {
  id: string;
  chantier: string; // uuid
  chantier_name?: string;
  supplier: string;
  reference: string;
  amount: string | number;
  date: string;
  status: 'brouillon' | 'valide' | 'paye';
  created_at: string;
}
