export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'sales';
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  source: 'Website' | 'Instagram' | 'Referral';
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LeadsResponse {
  leads: Lead[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export {};
