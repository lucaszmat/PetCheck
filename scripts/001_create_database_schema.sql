-- Criar tabela de perfis de usuários (tutores)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Criar tabela de pets
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  especie TEXT NOT NULL DEFAULT 'cão',
  raca TEXT,
  data_nascimento DATE,
  peso DECIMAL(5,2),
  cor TEXT,
  sexo TEXT CHECK (sexo IN ('macho', 'fêmea')),
  castrado BOOLEAN DEFAULT FALSE,
  foto_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela pets
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pets
CREATE POLICY "pets_select_own" ON public.pets FOR SELECT USING (auth.uid() = tutor_id);
CREATE POLICY "pets_insert_own" ON public.pets FOR INSERT WITH CHECK (auth.uid() = tutor_id);
CREATE POLICY "pets_update_own" ON public.pets FOR UPDATE USING (auth.uid() = tutor_id);
CREATE POLICY "pets_delete_own" ON public.pets FOR DELETE USING (auth.uid() = tutor_id);

-- Criar tabela de consultas veterinárias
CREATE TABLE IF NOT EXISTS public.consultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  veterinario TEXT NOT NULL,
  clinica TEXT,
  data_consulta TIMESTAMP WITH TIME ZONE NOT NULL,
  motivo TEXT NOT NULL,
  diagnostico TEXT,
  tratamento TEXT,
  observacoes TEXT,
  valor DECIMAL(10,2),
  status TEXT DEFAULT 'agendada' CHECK (status IN ('agendada', 'realizada', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela consultas
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para consultas
CREATE POLICY "consultas_select_own" ON public.consultas FOR SELECT USING (auth.uid() = tutor_id);
CREATE POLICY "consultas_insert_own" ON public.consultas FOR INSERT WITH CHECK (auth.uid() = tutor_id);
CREATE POLICY "consultas_update_own" ON public.consultas FOR UPDATE USING (auth.uid() = tutor_id);
CREATE POLICY "consultas_delete_own" ON public.consultas FOR DELETE USING (auth.uid() = tutor_id);

-- Criar tabela de vacinas
CREATE TABLE IF NOT EXISTS public.vacinas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome_vacina TEXT NOT NULL,
  data_aplicacao DATE NOT NULL,
  data_proxima_dose DATE,
  veterinario TEXT,
  clinica TEXT,
  lote TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela vacinas
ALTER TABLE public.vacinas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para vacinas
CREATE POLICY "vacinas_select_own" ON public.vacinas FOR SELECT USING (auth.uid() = tutor_id);
CREATE POLICY "vacinas_insert_own" ON public.vacinas FOR INSERT WITH CHECK (auth.uid() = tutor_id);
CREATE POLICY "vacinas_update_own" ON public.vacinas FOR UPDATE USING (auth.uid() = tutor_id);
CREATE POLICY "vacinas_delete_own" ON public.vacinas FOR DELETE USING (auth.uid() = tutor_id);

-- Criar tabela de lembretes/notificações
CREATE TABLE IF NOT EXISTS public.lembretes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_lembrete TIMESTAMP WITH TIME ZONE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('consulta', 'vacina', 'medicamento', 'alimentacao', 'outro')),
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'cancelado')),
  recorrencia TEXT CHECK (recorrencia IN ('unica', 'diaria', 'semanal', 'mensal', 'anual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela lembretes
ALTER TABLE public.lembretes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para lembretes
CREATE POLICY "lembretes_select_own" ON public.lembretes FOR SELECT USING (auth.uid() = tutor_id);
CREATE POLICY "lembretes_insert_own" ON public.lembretes FOR INSERT WITH CHECK (auth.uid() = tutor_id);
CREATE POLICY "lembretes_update_own" ON public.lembretes FOR UPDATE USING (auth.uid() = tutor_id);
CREATE POLICY "lembretes_delete_own" ON public.lembretes FOR DELETE USING (auth.uid() = tutor_id);
