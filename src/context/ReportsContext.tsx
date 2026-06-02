import React, { createContext, useContext, useEffect, useState } from 'react';
import { Report, ReportStatus } from '../types';
import { useAuth } from './AuthContext';
import {
  getReports,
  addReport as storageAdd,
  updateReport as storageUpdate,
  deleteReport as storageDelete,
  updateReportStatus as storageUpdateStatus,
} from '../repositories/ReportRepository';

interface ReportsContextValue {
  reports: Report[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  addReport: (report: Report) => Promise<void>;
  updateReport: (report: Report) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  updateStatus: (id: string, status: ReportStatus, comment: string) => Promise<void>;
}

const ReportsContext = createContext<ReportsContextValue | null>(null);

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function clearError() {
    setError(null);
  }

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    async function load() {
      try {
        const stored = await getReports();
        setReports(stored);
      } catch {
        setError('Erro ao carregar os relatos.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  async function addReport(report: Report) {
    try {
      const saved = await storageAdd(report);
      setReports((prev) => [...prev, saved]);
    } catch {
      setError('Erro ao salvar relato. Tente novamente.');
    }
  }

  async function updateReport(updated: Report) {
    try {
      await storageUpdate(updated);
      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch {
      setError('Erro ao atualizar relato.');
    }
  }

  async function deleteReport(id: string) {
    try {
      await storageDelete(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError('Erro ao excluir relato.');
    }
  }

  async function updateStatus(id: string, status: ReportStatus, comment: string) {
    const report = reports.find((r) => r.id === id);
    if (!report) return;
    const updated: Report = {
      ...report,
      status,
      updates: [
        ...report.updates,
        { timestamp: new Date().toISOString(), status, comment },
      ],
    };
    try {
      await storageUpdateStatus(id, status, comment);
      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch {
      setError('Erro ao atualizar o status.');
    }
  }

  return (
    <ReportsContext.Provider
      value={{ reports, loading, error, clearError, addReport, updateReport, deleteReport, updateStatus }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports(): ReportsContextValue {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error('useReports must be used inside ReportsProvider');
  return ctx;
}
