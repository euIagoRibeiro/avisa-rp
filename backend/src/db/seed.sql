-- Seed: usuário administrador
--
-- Como executar:
--   mysql -u root -p avisarp < backend/src/db/seed.sql
-- Ou dentro do cliente MySQL:
--   USE avisarp;
--   SOURCE /caminho/completo/backend/src/db/seed.sql;

INSERT INTO users (id, name, email, phone_hash, password, role, verified, created_at)
VALUES (
  UUID(),
  'Administrador',
  'admin@avisarp.com',
  -- SHA-256 de "16900000000"
  'fe289ecfc243d51411ad999319ee462cd8b5b4ad0008a52d9e05448d4e798619',
  -- bcrypt de "admin123" (custo 10)
  '$2b$10$4sgk8PyQVbNqFWai7g1VuOJcHLQrIznqnXHef3S87g/Wn5X1IT05m',
  'admin',
  TRUE,
  NOW()
)
ON DUPLICATE KEY UPDATE
  role     = VALUES(role),
  verified = VALUES(verified);
