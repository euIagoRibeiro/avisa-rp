import { Report, ReportStatus } from '../types';
import { ReportSchema } from '../schemas/reportSchema';
import * as reportService from '../services/reportService';

export async function getReports(): Promise<Report[]> {
  const data = await reportService.getAll();
  return data
    .map((item) => ReportSchema.safeParse(item))
    .filter((r) => r.success)
    .map((r) => r.data as Report);
}

export async function addReport(report: Report): Promise<Report> {
  return reportService.create(report);
}

export async function updateReport(updated: Report): Promise<void> {
  return reportService.update(updated);
}

export async function deleteReport(id: string): Promise<void> {
  return reportService.remove(id);
}

export async function updateReportStatus(
  id: string,
  status: ReportStatus,
  comment: string,
): Promise<void> {
  return reportService.updateStatus(id, status, comment);
}
