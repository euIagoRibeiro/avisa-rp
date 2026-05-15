import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// GET /v1/reports — cidadão vê os seus; admin vê todos
router.get('/', (_req, res) => {
  res.status(501).json({ message: 'TODO: listar relatos' });
});

// POST /v1/reports — apenas cidadão cria relatos
router.post('/', requireRole('cidadao'), (_req, res) => {
  res.status(501).json({ message: 'TODO: criar relato' });
});

// PUT /v1/reports/:id — autor edita (só se Pendente); admin pode editar qualquer
router.put('/:id', (_req, res) => {
  res.status(501).json({ message: 'TODO: atualizar relato' });
});

// DELETE /v1/reports/:id — autor exclui o próprio; admin exclui qualquer
router.delete('/:id', (_req, res) => {
  res.status(501).json({ message: 'TODO: excluir relato' });
});

// PUT /v1/reports/:id/status — apenas admin, cria registro em report_updates
router.put('/:id/status', requireRole('admin'), (_req, res) => {
  res.status(501).json({ message: 'TODO: atualizar status' });
});

export default router;
