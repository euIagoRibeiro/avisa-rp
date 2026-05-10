export type UserRole = 'cidadao' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type ReportStatus = 'Pendente' | 'Analisando' | 'Resolvido';

export interface ReportUpdate {
  timestamp: string;
  status: ReportStatus;
  comment: string;
}

export interface Report {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  address: string;
  coordinates: { lat: number; lon: number };
  status: ReportStatus;
  isAnonymous: boolean;
  photos: string[];
  createdAt: string;
  updates: ReportUpdate[];
}
