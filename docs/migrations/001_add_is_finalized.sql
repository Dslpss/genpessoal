-- Migration: 001_add_is_finalized.sql
-- Adiciona coluna "is_finalized" em shopping_sessions e política exemplo de UPDATE.
-- Execute este script no editor SQL do Supabase.

BEGIN;

-- 1) Adiciona coluna com valor default false (seguro em produção)
ALTER TABLE shopping_sessions
  ADD COLUMN IF NOT EXISTS is_finalized boolean DEFAULT false;

-- 2) (Opcional) Ajuste histórico: marque sessões antigas como finalizadas conforme sua regra
-- Exemplo (ajuste a condição conforme sua necessidade):
-- UPDATE shopping_sessions SET is_finalized = true WHERE created_at < now() - interval '1 year';

-- 3) Exemplo de policy para permitir que o dono atualize a coluna (ajuste conforme seu esquema de auth)
-- ATENÇÃO: revise as políticas de RLS antes de aplicar em produção.
CREATE POLICY IF NOT EXISTS allow_owner_update_is_finalized ON shopping_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMIT;

-- Observações:
-- - Se você usa RLS, certifique-se de que a policy acima esteja alinhada com as existentes.
-- - Caso prefira, aplique a alteração via interface do Supabase SQL Editor.
