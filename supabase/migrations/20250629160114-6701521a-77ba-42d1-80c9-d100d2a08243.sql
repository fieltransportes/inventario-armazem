
-- Adicionar coluna de status de aprovação na tabela profiles
ALTER TABLE public.profiles ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Adicionar índice para melhor performance nas consultas de aprovação
CREATE INDEX idx_profiles_approval_status ON public.profiles(approval_status);

-- Atualizar a política RLS para permitir que admins e managers vejam usuários pendentes
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins and managers can view all profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    public.get_user_role(auth.uid()) IN ('admin', 'manager')
  );

-- Política para permitir que admins e managers aprovem usuários
CREATE POLICY "Admins and managers can approve users" ON public.profiles
  FOR UPDATE USING (
    public.get_user_role(auth.uid()) IN ('admin', 'manager')
  );

-- Função para verificar se usuário está aprovado
CREATE OR REPLACE FUNCTION public.is_user_approved(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT approval_status = 'approved' FROM public.profiles WHERE id = user_id;
$$;

-- Atualizar políticas existentes para considerar apenas usuários aprovados
DROP POLICY IF EXISTS "Users can create inventories" ON public.inventories;
CREATE POLICY "Approved users can create inventories" ON public.inventories
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    public.is_user_approved(auth.uid())
  );

DROP POLICY IF EXISTS "Users can view assigned inventories" ON public.inventories;
CREATE POLICY "Approved users can view assigned inventories" ON public.inventories
  FOR SELECT USING (
    public.is_user_approved(auth.uid()) AND (
      auth.uid() = user_id OR 
      auth.uid() = ANY(assigned_users) OR
      public.get_user_role(auth.uid()) IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "Inventory owners and managers can update" ON public.inventories;
CREATE POLICY "Approved inventory owners and managers can update" ON public.inventories
  FOR UPDATE USING (
    public.is_user_approved(auth.uid()) AND (
      auth.uid() = user_id OR
      public.get_user_role(auth.uid()) IN ('admin', 'manager')
    )
  );

-- Atualizar trigger para definir usuários como pendentes por padrão
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, approval_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user',
    'pending'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
