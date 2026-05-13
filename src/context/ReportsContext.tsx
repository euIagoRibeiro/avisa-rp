import React, { createContext, useContext, useEffect, useState } from 'react';
import { Report, ReportStatus } from '../types';
import { MOCK_REPORTS } from '../constants/mockData';
import {
  getReports,
  addReport as storageAdd,
  updateReport as storageUpdate,
  deleteReport as storageDelete,
} from '../repositories/ReportRepository';

const TENANT_ID = 'ribeirao-preto';

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
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function clearError() {
    setError(null);
  }

  useEffect(() => {
    async function load() {
      try {
        let stored = await getReports(TENANT_ID);
        if (stored.length === 0) {
          for (const report of MOCK_REPORTS) {
            await storageAdd(report);
          }
          stored = MOCK_REPORTS;
        }
        setReports(stored);
      } catch {
        setError('Erro ao carregar os relatos.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function addReport(report: Report) {
    try {
      await storageAdd(report);
      setReports((prev) => [...prev, report]);
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
      await storageDelete(id, TENANT_ID);
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
      await storageUpdate(updated);
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
