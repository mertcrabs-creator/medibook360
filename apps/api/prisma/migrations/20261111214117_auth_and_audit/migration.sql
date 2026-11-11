-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "last_active_at" TIMESTAMPTZ(3) NOT NULL,
    "mfa" TEXT,
    "metadata" JSONB,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mfa_authenticators" (
    "user_id" UUID NOT NULL,
    "secret" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL,
    "pending_secret" TEXT,
    "last_used_step" INTEGER,

    CONSTRAINT "mfa_authenticators_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "mfa_recovery_codes" (
    "user_id" UUID NOT NULL,
    "code_hash" TEXT NOT NULL,

    CONSTRAINT "mfa_recovery_codes_pkey" PRIMARY KEY ("user_id","code_hash")
);

-- CreateTable
CREATE TABLE "mfa_failures" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "failed_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "mfa_failures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "ip" TEXT,
    "user_agent" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE INDEX "mfa_failures_user_id_failed_at_idx" ON "mfa_failures"("user_id", "failed_at");

-- CreateIndex
CREATE INDEX "mfa_failures_failed_at_idx" ON "mfa_failures"("failed_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
