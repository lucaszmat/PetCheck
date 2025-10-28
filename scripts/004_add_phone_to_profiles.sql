-- Adicionar campo de telefone à tabela de perfis
ALTER TABLE profiles ADD COLUMN phone VARCHAR(20);
ALTER TABLE profiles ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;

-- Atualizar política RLS para incluir telefone
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
