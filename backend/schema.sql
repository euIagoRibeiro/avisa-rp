-- Avisa RP — Schema MariaDB
-- Execute: mysql -u root < schema.sql

CREATE DATABASE IF NOT EXISTS avisarp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE avisarp;

CREATE TABLE IF NOT EXISTS users (
  id           CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  phone_hash   CHAR(64)     NOT NULL UNIQUE,  -- SHA-256 do telefone normalizado (só dígitos + DDD)
  password     VARCHAR(255) NOT NULL,          -- bcrypt hash
  role         ENUM('cidadao', 'admin') NOT NULL DEFAULT 'cidadao',
  verified     BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Cadastros pendentes de verificação por OTP (pode ser substituído por Redis)
CREATE TABLE IF NOT EXISTS otp_codes (
  id           CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  phone_hash   CHAR(64)     NOT NULL,
  code_hash    CHAR(64)     NOT NULL,  -- hash do código OTP de 6 dígitos
  name         VARCHAR(100) NOT NULL,  -- dados do cadastro pendente
  email        VARCHAR(150) NOT NULL,
  password     VARCHAR(255) NOT NULL,  -- já com bcrypt aplicado
  expires_at   DATETIME     NOT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
  id           CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
  user_id      CHAR(36)      NOT NULL,
  title        VARCHAR(80)   NOT NULL,
  description  TEXT,
  category     VARCHAR(50)   NOT NULL,
  address      VARCHAR(255)  NOT NULL,
  lat          DECIMAL(10,7) NOT NULL,
  lon          DECIMAL(10,7) NOT NULL,
  status       ENUM('Pendente', 'Analisando', 'Resolvido') NOT NULL DEFAULT 'Pendente',
  is_anonymous BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS report_updates (
  id           CHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  report_id    CHAR(36)  NOT NULL,
  status       ENUM('Pendente', 'Analisando', 'Resolvido') NOT NULL,
  comment      TEXT,
  created_at   DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_updates_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS report_photos (
  id           CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
  report_id    CHAR(36)      NOT NULL,
  url          VARCHAR(500)  NOT NULL,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_photos_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);
