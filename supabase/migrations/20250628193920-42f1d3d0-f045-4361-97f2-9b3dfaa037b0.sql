
-- Primeiro, criar as tabelas básicas
CREATE TABLE public.inventories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_number TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  search_filters JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed')),
  notes TEXT,
  user_id UUID REFERENCES auth.users(id)
);

CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id UUID NOT NULL REFERENCES public.inventories(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  expected_quantity DECIMAL NOT NULL,
  counted_quantity DECIMAL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar coluna para usuários designados
ALTER TABLE public.inventories ADD COLUMN assigned_users UUID[] DEFAULT '{}';

-- Criar índices para melhor performance
CREATE INDEX idx_inventories_number ON public.inventories(inventory_number);
CREATE INDEX idx_inventory_items_inventory_id ON public.inventory_items(inventory_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.inventories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar funções de segurança
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.user_has_inventory_access(inventory_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.inventories 
    WHERE id = inventory_id 
    AND (
      inventories.user_id = user_id OR 
      user_id = ANY(inventories.assigned_users) OR
      public.get_user_role(user_id) IN ('admin', 'manager')
    )
  );
$$;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Políticas RLS para inventories
CREATE POLICY "Users can create inventories" ON public.inventories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view assigned inventories" ON public.inventories
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = ANY(assigned_users) OR
    public.get_user_role(auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "Inventory owners and managers can update" ON public.inventories
  FOR UPDATE USING (
    auth.uid() = user_id OR
    public.get_user_role(auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "Admins can delete inventories" ON public.inventories
  FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- Políticas RLS para inventory_items
CREATE POLICY "Users can view inventory items they have access to" ON public.inventory_items
  FOR SELECT USING (public.user_has_inventory_access(inventory_id, auth.uid()));

CREATE POLICY "Users can update inventory items they have access to" ON public.inventory_items
  FOR UPDATE USING (public.user_has_inventory_access(inventory_id, auth.uid()));

CREATE POLICY "Users can insert inventory items they have access to" ON public.inventory_items
  FOR INSERT WITH CHECK (public.user_has_inventory_access(inventory_id, auth.uid()));

-- Trigger para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
