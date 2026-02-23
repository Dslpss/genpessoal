-- Migration: 002_totals_triggers.sql
-- Cria função e triggers para manter total_shared_cost e total_personal_cost atualizados
-- Execute este script no editor SQL do Supabase (após criar as tabelas se necessário).

BEGIN;

-- Função que recalcula os totais de uma sessão a partir dos itens
CREATE OR REPLACE FUNCTION public.recalculate_session_totals()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  session_uuid uuid;
  shared_sum numeric := 0;
  personal_sum numeric := 0;
BEGIN
  -- Determina qual sessão foi afetada
  session_uuid := COALESCE(NEW.session_id, OLD.session_id);
  IF session_uuid IS NULL THEN
    RETURN NULL;
  END IF;

  -- Soma os itens não-pessoais
  SELECT COALESCE(SUM(price * quantity),0) INTO shared_sum
  FROM expense_items
  WHERE session_id = session_uuid AND (is_personal IS NULL OR is_personal = false);

  -- Soma os itens pessoais
  SELECT COALESCE(SUM(price * quantity),0) INTO personal_sum
  FROM expense_items
  WHERE session_id = session_uuid AND is_personal = true;

  -- Atualiza a sessão com os novos totais
  UPDATE shopping_sessions
  SET total_shared_cost = shared_sum,
      total_personal_cost = personal_sum
  WHERE id = session_uuid;

  RETURN NULL;
END;
$$;

-- Trigger que aciona a função após INSERT/UPDATE/DELETE em expense_items
DROP TRIGGER IF EXISTS trg_recalculate_session_totals ON expense_items;
CREATE TRIGGER trg_recalculate_session_totals
AFTER INSERT OR UPDATE OR DELETE ON expense_items
FOR EACH ROW
EXECUTE FUNCTION public.recalculate_session_totals();

COMMIT;

-- Observações:
-- - Se você utiliza RLS, assegure-se de que a policy permita que a função/trigger atualize a tabela shopping_sessions.
-- - Caso a função não tenha permissão para atualizar por causa de RLS, crie a função como SECURITY DEFINER e ajuste o owner com cuidado.
