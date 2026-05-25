import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import db from '../config/database';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// ── constantes ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Buraco',
  'Iluminação Pública',
  'Lixo',
  'Poda de Árvore',
  'Foco de Dengue',
  'Sinalização',
  'Vazamento de Água',
  'Calçada Danificada',
  'Outros',
] as const;

const STATUSES = ['Pendente', 'Analisando', 'Resolvido'] as const;

// ── schemas ───────────────────────────────────────────────────────────────────

const CreateReportSchema = z.object({
  title:       z.string().min(1).max(80),
  description: z.string().optional(),
  category:    z.enum(CATEGORIES),
  address:     z.string().min(1).max(255),
  lat:         z.number(),
  lon:         z.number(),
  isAnonymous: z.boolean().default(false),
  photos:      z.array(z.string().min(1)).default([]),
});

const UpdateReportSchema = z.object({
  title:       z.string().min(1).max(80).optional(),
  description: z.string().optional(),
  category:    z.enum(CATEGORIES).optional(),
  photos:      z.array(z.string().min(1)).optional(),
});

const UpdateStatusSchema = z.object({
  status:  z.enum(STATUSES),
  comment: z.string().optional(),
});

// ── tipos internos ────────────────────────────────────────────────────────────

interface ReportRow {
  id:           string;
  user_id:      string;
  title:        string;
  description:  string | null;
  category:     string;
  address:      string;
  lat:          string | number;
  lon:          string | number;
  status:       string;
  is_anonymous: number | boolean;
  created_at:   Date | string;
}

interface PhotoRow {
  url: string;
}

interface UpdateRow {
  status:     string;
  comment:    string | null;
  created_at: Date | string;
}

// ── helpers ───────────────────────────────────────────────────────────────────

function toISO(d: Date | string): string {
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
}

function formatReport(
  report: ReportRow,
  photos: PhotoRow[],
  updates: UpdateRow[],
  isAdmin: boolean,
) {
  const isAnonymous = Boolean(report.is_anonymous);
  return {
    id:          report.id,
    title:       report.title,
    description: report.description,
    category:    report.category,
    address:     report.address,
    lat:         parseFloat(String(report.lat)),
    lon:         parseFloat(String(report.lon)),
    status:      report.status,
    isAnonymous,
    userId:      isAnonymous && !isAdmin ? undefined : report.user_id,
    photos:      photos.map(p => p.url),
    createdAt:   toISO(report.created_at),
    updates:     updates.map(u => ({
      status:    u.status,
      comment:   u.comment,
      createdAt: toISO(u.created_at),
    })),
  };
}

function fetchPhotos(reportId: string): Promise<PhotoRow[]> {
  return db('report_photos').where('report_id', reportId).select('url');
}

function fetchUpdates(reportId: string): Promise<UpdateRow[]> {
  return db('report_updates')
    .where('report_id', reportId)
    .orderBy('created_at', 'asc')
    .select('status', 'comment', 'created_at');
}

// ── GET /v1/reports ───────────────────────────────────────────────────────────

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { userId, role } = req.user!;
  const page   = Math.max(1, parseInt(String(req.query.page  ?? '1'),  10) || 1);
  const limit  = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20));
  const offset = (page - 1) * limit;

  const status   = req.query.status   as string | undefined;
  const category = req.query.category as string | undefined;
  const search   = req.query.search   as string | undefined;

  try {
    const buildQuery = () => {
      let q = db('reports');
      if (role === 'cidadao') q = q.where('user_id', userId);
      if (status)   q = q.where('status',   status);
      if (category) q = q.where('category', category);
      if (search) {
        q = q.where(qb => {
          qb.where('title', 'like', `%${search}%`)
            .orWhere('address', 'like', `%${search}%`);
        });
      }
      return q;
    };

    const [countRow, rows] = await Promise.all([
      buildQuery().count<{ count: string }>({ count: '*' }).first(),
      buildQuery().orderBy('created_at', 'desc').limit(limit).offset(offset).select('*'),
    ]);

    const total = parseInt(String(countRow?.count ?? '0'), 10);
    const isAdmin = role === 'admin';

    const data = await Promise.all(
      (rows as ReportRow[]).map(async row => {
        const [photos, updates] = await Promise.all([fetchPhotos(row.id), fetchUpdates(row.id)]);
        return formatReport(row, photos, updates, isAdmin);
      }),
    );

    res.json({ data, total, page, limit });
  } catch (err) {
    console.error('[GET /reports]', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ── POST /v1/reports ──────────────────────────────────────────────────────────

router.post('/', requireRole('cidadao'), async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateReportSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
    return;
  }

  const { title, description, category, address, lat, lon, isAnonymous, photos } = parsed.data;
  const { userId } = req.user!;
  const reportId = randomUUID();

  try {
    await db('reports').insert({
      id:           reportId,
      user_id:      userId,
      title,
      description:  description ?? null,
      category,
      address,
      lat,
      lon,
      status:       'Pendente',
      is_anonymous: isAnonymous,
    });

    if (photos.length > 0) {
      await db('report_photos').insert(
        photos.map(url => ({ id: randomUUID(), report_id: reportId, url })),
      );
    }

    const [report, photoRows, updateRows] = await Promise.all([
      db('reports').where('id', reportId).first() as Promise<ReportRow | undefined>,
      fetchPhotos(reportId),
      fetchUpdates(reportId),
    ]);

    if (!report) {
      res.status(500).json({ error: 'Erro ao recuperar relato criado' });
      return;
    }

    res.status(201).json(formatReport(report, photoRows, updateRows, false));
  } catch (err) {
    console.error('[POST /reports]', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ── PUT /v1/reports/:id ───────────────────────────────────────────────────────

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id }     = req.params;
  const { userId } = req.user!;

  const parsed = UpdateReportSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
    return;
  }

  try {
    const report = await db('reports').where('id', id).first() as ReportRow | undefined;

    if (!report) {
      res.status(404).json({ error: 'Relato não encontrado' });
      return;
    }

    if (report.user_id !== userId) {
      res.status(403).json({ error: 'Sem permissão' });
      return;
    }

    if (report.status !== 'Pendente') {
      res.status(409).json({ error: 'Relato só pode ser editado enquanto estiver Pendente' });
      return;
    }

    const { title, description, category, photos } = parsed.data;
    const changes: Record<string, unknown> = {};
    if (title !== undefined)       changes.title       = title;
    if (description !== undefined) changes.description = description;
    if (category !== undefined)    changes.category    = category;

    if (Object.keys(changes).length > 0) {
      await db('reports').where('id', id).update(changes);
    }

    if (photos !== undefined) {
      await db('report_photos').where('report_id', id).delete();
      if (photos.length > 0) {
        await db('report_photos').insert(
          photos.map(url => ({ id: randomUUID(), report_id: id, url })),
        );
      }
    }

    const [updated, photoRows, updateRows] = await Promise.all([
      db('reports').where('id', id).first() as Promise<ReportRow | undefined>,
      fetchPhotos(id),
      fetchUpdates(id),
    ]);

    if (!updated) {
      res.status(500).json({ error: 'Erro ao recuperar relato atualizado' });
      return;
    }

    res.json(formatReport(updated, photoRows, updateRows, false));
  } catch (err) {
    console.error('[PUT /reports/:id]', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ── DELETE /v1/reports/:id ────────────────────────────────────────────────────

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id }         = req.params;
  const { userId, role } = req.user!;

  try {
    const report = await db('reports').where('id', id).first() as ReportRow | undefined;

    if (!report) {
      res.status(404).json({ error: 'Relato não encontrado' });
      return;
    }

    if (role !== 'admin' && report.user_id !== userId) {
      res.status(403).json({ error: 'Sem permissão' });
      return;
    }

    await db('reports').where('id', id).delete();
    res.status(204).end();
  } catch (err) {
    console.error('[DELETE /reports/:id]', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ── PUT /v1/reports/:id/status ────────────────────────────────────────────────

router.put('/:id/status', requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const parsed = UpdateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
    return;
  }

  const { status, comment } = parsed.data;

  try {
    const report = await db('reports').where('id', id).first() as ReportRow | undefined;

    if (!report) {
      res.status(404).json({ error: 'Relato não encontrado' });
      return;
    }

    await db('reports').where('id', id).update({ status });
    await db('report_updates').insert({
      id:        randomUUID(),
      report_id: id,
      status,
      comment:   comment ?? null,
    });

    const updates = await fetchUpdates(id);

    res.json({
      id,
      status,
      updates: updates.map(u => ({
        status:    u.status,
        comment:   u.comment,
        createdAt: toISO(u.created_at),
      })),
    });
  } catch (err) {
    console.error('[PUT /reports/:id/status]', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
