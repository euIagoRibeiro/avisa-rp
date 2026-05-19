import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createHash, randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database';

const router = Router();

// ── helpers ───────────────────────────────────────────────────────────────────

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function formatPhone(digits: string): string {
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
}

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function signToken(userId: string, role: 'cidadao' | 'admin'): string {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' },
  );
}

// ── schemas ───────────────────────────────────────────────────────────────────

const RegisterSchema = z.object({
  name:     z.string().min(1),
  email:    z.string().email(),
  phone:    z.string().min(10).max(15),
  password: z.string().min(6),
});

const VerifyOTPSchema = z.object({
  phone: z.string().min(1),
  code:  z.string().length(6),
});

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

const ResendOTPSchema = z.object({
  phone: z.string().min(10).max(15),
});

// ── POST /v1/auth/register ────────────────────────────────────────────────────

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
    return;
  }

  const { name, email, password } = parsed.data;
  const phone     = normalizePhone(parsed.data.phone);
  const phoneHash = sha256(phone);

  try {
    // Verifica unicidade em users (telefone ou e-mail)
    const existingUser = await db('users')
      .where('phone_hash', phoneHash)
      .orWhere('email', email)
      .first();

    if (existingUser) {
      res.status(409).json({ error: 'Telefone ou e-mail já cadastrado' });
      return;
    }

    // Verifica cadastro pendente em otp_codes
    const existingOtp = await db('otp_codes')
      .where('phone_hash', phoneHash)
      .first();

    if (existingOtp) {
      res.status(409).json({ error: 'Já existe um cadastro pendente para este telefone' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otpCode      = generateOTP();
    const otpHash      = sha256(otpCode);
    const expiresAt    = new Date(Date.now() + 10 * 60 * 1000);

    await db('otp_codes').insert({
      id:         randomUUID(),
      phone_hash: phoneHash,
      code_hash:  otpHash,
      name,
      email,
      password:   passwordHash,
      expires_at: expiresAt,
    });

    console.log(`[OTP] Telefone: ${phone} | Código: ${otpCode}`);

    res.status(201).json({ message: `Código enviado para ${formatPhone(phone)}` });
  } catch (err) {
    console.error('[register]', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ── POST /v1/auth/verify-otp ──────────────────────────────────────────────────

router.post('/verify-otp', async (req: Request, res: Response): Promise<void> => {
  const parsed = VerifyOTPSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
    return;
  }

  const phone     = normalizePhone(parsed.data.phone);
  const phoneHash = sha256(phone);
  const codeHash  = sha256(parsed.data.code);

  try {
    const otpRecord = await db('otp_codes')
      .where('phone_hash', phoneHash)
      .first();

    if (!otpRecord) {
      res.status(404).json({ error: 'Cadastro pendente não encontrado' });
      return;
    }

    if (new Date() > new Date(otpRecord.expires_at)) {
      res.status(400).json({ error: 'Código expirado' });
      return;
    }

    if (codeHash !== otpRecord.code_hash) {
      res.status(400).json({ error: 'Código inválido' });
      return;
    }

    const userId = randomUUID();

    await db('users').insert({
      id:         userId,
      name:       otpRecord.name,
      email:      otpRecord.email,
      phone_hash: phoneHash,
      password:   otpRecord.password,
      role:       'cidadao',
      verified:   true,
    });

    await db('otp_codes').where('phone_hash', phoneHash).delete();

    const token = signToken(userId, 'cidadao');

    res.status(201).json({
      token,
      user: {
        id:    userId,
        name:  otpRecord.name,
        email: otpRecord.email,
        role:  'cidadao',
      },
    });
  } catch (err) {
    console.error('[verify-otp]', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ── POST /v1/auth/login ───────────────────────────────────────────────────────

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const user = await db('users').where('email', email).first();

    if (!user) {
      res.status(401).json({ error: 'Email ou senha incorretos' });
      return;
    }

    if (!user.verified) {
      res.status(403).json({ error: 'Conta não verificada. Complete a verificação por OTP.' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Email ou senha incorretos' });
      return;
    }

    const token = signToken(user.id, user.role);

    res.status(200).json({
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ── POST /v1/auth/resend-otp ──────────────────────────────────────────────────

router.post('/resend-otp', async (req: Request, res: Response): Promise<void> => {
  const parsed = ResendOTPSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
    return;
  }

  const phone     = normalizePhone(parsed.data.phone);
  const phoneHash = sha256(phone);

  try {
    const existing = await db('otp_codes').where('phone_hash', phoneHash).first();

    if (!existing) {
      res.status(404).json({ error: 'Cadastro pendente não encontrado' });
      return;
    }

    await db('otp_codes').where('phone_hash', phoneHash).delete();

    const otpCode   = generateOTP();
    const otpHash   = sha256(otpCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db('otp_codes').insert({
      id:         randomUUID(),
      phone_hash: phoneHash,
      code_hash:  otpHash,
      name:       existing.name,
      email:      existing.email,
      password:   existing.password,
      expires_at: expiresAt,
    });

    console.log(`[OTP REENVIO] Telefone: ${phone} | Código: ${otpCode}`);

    res.status(200).json({ message: `Novo código enviado para ${formatPhone(phone)}` });
  } catch (err) {
    console.error('[resend-otp]', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ── POST /v1/auth/logout ──────────────────────────────────────────────────────

router.post('/logout', (_req: Request, res: Response): void => {
  res.status(204).end();
});

export default router;
