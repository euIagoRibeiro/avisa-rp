import { api } from './api';
import { Report, ReportStatus } from '../types';

interface ReportApiItem {
  id: string;
  userId?: string;
  title: string;
  description: string | null;
  category: string;
  address: string;
  lat: number;
  lon: number;
  status: ReportStatus;
  isAnonymous: boolean;
  photos: string[];
  createdAt: string;
  updates: { status: ReportStatus; comment: string | null; createdAt: string }[];
}

interface ReportsEnvelope {
  data: ReportApiItem[];
  total: number;
  page: number;
  limit: number;
}

export async function getAll(): Promise<Report[]> {
  const res = await api.get<ReportsEnvelope>('/reports');
  return res.data.data.map((item) => ({
    id: item.id,
    userId: item.userId ?? '',
    title: item.title,
    description: item.description ?? '',
    category: item.category,
    address: item.address,
    coordinates: { lat: item.lat, lon: item.lon },
    status: item.status,
    isAnonymous: item.isAnonymous,
    photos: item.photos,
    createdAt: item.createdAt,
    updates: item.updates.map((u) => ({
      timestamp: u.createdAt,
      status: u.status,
      comment: u.comment ?? '',
    })),
  }));
}

export async function create(report: Report): Promise<Report> {
  const body = {
    title:       report.title,
    description: report.description || undefined,
    category:    report.category,
    address:     report.address,
    lat:         report.coordinates.lat,
    lon:         report.coordinates.lon,
    isAnonymous: report.isAnonymous,
    photos:      [] as string[],
  };
  const res = await api.post<ReportApiItem>('/reports', body);
  const item = res.data;
  return {
    id:          item.id,
    userId:      item.userId ?? '',
    title:       item.title,
    description: item.description ?? '',
    category:    item.category,
    address:     item.address,
    coordinates: { lat: item.lat, lon: item.lon },
    status:      item.status,
    isAnonymous: item.isAnonymous,
    photos:      item.photos,
    createdAt:   item.createdAt,
    updates:     item.updates.map((u) => ({
      timestamp: u.createdAt,
      status:    u.status,
      comment:   u.comment ?? '',
    })),
  };
}

export async function update(report: Report): Promise<void> {
  await api.put(`/reports/${report.id}`, report);
}

export async function remove(id: string): Promise<void> {
  await api.delete(`/reports/${id}`);
}

export async function updateStatus(
  id: string,
  status: ReportStatus,
  comment: string,
): Promise<void> {
  await api.put(`/reports/${id}/status`, { status, comment });
}
