-- Criar tabela de medicamentos
CREATE TABLE IF NOT EXISTS public.medicamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome_medicamento TEXT NOT NULL,
  dosagem TEXT NOT NULL,
  frequencia TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_termino DATE,
  observacoes TEXT,
  medicamento_ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela medicamentos
ALTER TABLE public.medicamentos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para medicamentos
CREATE POLICY "medicamentos_select_own" ON public.medicamentos FOR SELECT USING (auth.uid() = tutor_id);
CREATE POLICY "medicamentos_insert_own" ON public.medicamentos FOR INSERT WITH CHECK (auth.uid() = tutor_id);
CREATE POLICY "medicamentos_update_own" ON public.medicamentos FOR UPDATE USING (auth.uid() = tutor_id);
CREATE POLICY "medicamentos_delete_own" ON public.medicamentos FOR DELETE USING (auth.uid() = tutor_id);

-- Atualizar tabela de consultas para incluir tipo_consulta
ALTER TABLE public.consultas ADD COLUMN IF NOT EXISTS tipo_consulta TEXT;
ALTER TABLE public.consultas DROP COLUMN IF EXISTS motivo;
