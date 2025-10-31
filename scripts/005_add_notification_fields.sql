-- Adicionar campos de notificação com antecedência na tabela consultas
ALTER TABLE public.consultas 
ADD COLUMN IF NOT EXISTS notificar_antecedencia BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS minutos_antecedencia INTEGER;

-- Adicionar campos de notificação com antecedência na tabela lembretes
ALTER TABLE public.lembretes 
ADD COLUMN IF NOT EXISTS notificar_antecedencia BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS minutos_antecedencia INTEGER;

-- Nota: Para vacinas e medicamentos, a API vai consultar diretamente os dados do banco
-- (como data_proxima_dose, data_inicio, frequencia) para decidir quando notificar,
-- então não precisamos de campos adicionais de notificação nessas tabelas.

