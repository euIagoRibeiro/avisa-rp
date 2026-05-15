import { Router } from 'express';

const router = Router();

// POST /v1/auth/register — inicia cadastro e envia OTP via SMS
router.post('/register', (_req, res) => {
  res.status(501).json({ message: 'TODO: implementar registro' });
});

// POST /v1/auth/verify-otp — confirma OTP, cria usuário e retorna JWT
router.post('/verify-otp', (_req, res) => {
  res.status(501).json({ message: 'TODO: implementar verificação OTP' });
});

// POST /v1/auth/login — autentica com email + senha
router.post('/login', (_req, res) => {
  res.status(501).json({ message: 'TODO: implementar login' });
});

// POST /v1/auth/logout — invalida token (blacklist via Redis)
router.post('/logout', (_req, res) => {
  res.status(204).end();
});

export default router;
