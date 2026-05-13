import AsyncStorage from '@react-native-async-storage/async-storage';
import { Report } from '../types';
import { ReportSchema } from '../schemas/reportSchema';

function storageKey(tenantId: string): string {
  return `reports_${tenantId}`;
}

export async function getReports(tenantId: string): Promise<Report[]> {
  const raw = await AsyncStorage.getItem(storageKey(tenantId));
  if (!raw) return [];
  const parsed = JSON.parse(raw) as unknown[];
  return parsed
    .map((item) => ReportSchema.safeParse(item))
    .filter((r) => r.success)
    .map((r) => r.data as Report);
}

export async function addReport(report: Report): Promise<void> {
  ReportSchema.parse(report);
  const reports = await getReports(report.tenantId);
  await AsyncStorage.setItem(
    storageKey(report.tenantId),
    JSON.stringify([...reports, report]),
  );
}

export async function updateReport(updated: Report): Promise<void> {
  ReportSchema.parse(updated);
  const reports = await getReports(updated.tenantId);
  const next = reports.map((r) => (r.id === updated.id ? updated : r));
  await AsyncStorage.setItem(storageKey(updated.tenantId), JSON.stringify(next));
}

export async function deleteReport(id: string, tenantId: string): Promise<void> {
  const reports = await getReports(tenantId);
  const next = reports.filter((r) => r.id !== id);
  await AsyncStorage.setItem(storageKey(tenantId), JSON.stringify(next));
}
