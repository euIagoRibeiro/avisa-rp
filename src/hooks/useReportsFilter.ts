import { useMemo, useState } from 'react';
import { Report, ReportStatus } from '../types';

type FilterOption = ReportStatus | 'Todos';

export function useReportsFilter(reports: Report[], userId: string, isAdmin: boolean) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('Todos');

  const roleFiltered = useMemo(
    () => (isAdmin ? reports : reports.filter((r) => r.userId === userId)),
    [reports, userId, isAdmin],
  );

  const stats = useMemo(
    () => ({
      total: roleFiltered.length,
      pendente: roleFiltered.filter((r) => r.status === 'Pendente').length,
      analisando: roleFiltered.filter((r) => r.status === 'Analisando').length,
      resolvido: roleFiltered.filter((r) => r.status === 'Resolvido').length,
    }),
    [roleFiltered],
  );

  const filtered = useMemo(() => {
    let result = roleFiltered;
    if (activeFilter !== 'Todos') {
      result = result.filter((r) => r.status === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.address.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q),
      );
    }
    return result;
  }, [roleFiltered, activeFilter, search]);

  return { filtered, search, setSearch, activeFilter, setActiveFilter, stats };
}
