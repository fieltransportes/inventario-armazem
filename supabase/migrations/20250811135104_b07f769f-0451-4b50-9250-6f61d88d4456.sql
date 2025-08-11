-- Fix critical security vulnerabilities in database functions
-- Add proper search_path to prevent schema injection attacks

-- Fix get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = user_id;
$function$;

-- Fix is_user_approved function  
CREATE OR REPLACE FUNCTION public.is_user_approved(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT approval_status = 'approved' FROM public.profiles WHERE id = user_id;
$function$;

-- Fix user_has_inventory_access function
CREATE OR REPLACE FUNCTION public.user_has_inventory_access(inventory_id uuid, user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.inventories 
    WHERE id = inventory_id 
    AND (
      inventories.user_id = user_id OR 
      user_id = ANY(inventories.assigned_users) OR
      public.get_user_role(user_id) IN ('admin', 'manager')
    )
  );
$function$;

-- Fix update_products_updated_at function
CREATE OR REPLACE FUNCTION public.update_products_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- Create tables for migrating localStorage data to Supabase

-- Tag mappings table
CREATE TABLE public.tag_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_tag TEXT NOT NULL,
  target_tag TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, source_tag, target_tag)
);

-- Text file mappings table  
CREATE TABLE public.text_file_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_pattern TEXT NOT NULL,
  tag_mappings JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, file_pattern)
);

-- Tag equivalences table
CREATE TABLE public.tag_equivalences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  equivalent_tags TEXT[] NOT NULL,
  UNIQUE(user_id, tag_name)
);

-- Supplier configurations table
CREATE TABLE public.supplier_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cnpj TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  source_tag TEXT NOT NULL,
  extraction_pattern TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, cnpj)
);

-- Product unit configurations table
CREATE TABLE public.product_unit_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_code TEXT NOT NULL,
  conversions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_code)
);

-- Enable RLS on all new tables
ALTER TABLE public.tag_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.text_file_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tag_equivalences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_unit_configs ENABLE ROW LEVEL SECURITY;

-- RLS policies for tag_mappings
CREATE POLICY "Users can manage their own tag mappings" ON public.tag_mappings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all tag mappings" ON public.tag_mappings FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

-- RLS policies for text_file_mappings
CREATE POLICY "Users can manage their own text file mappings" ON public.text_file_mappings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all text file mappings" ON public.text_file_mappings FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

-- RLS policies for tag_equivalences
CREATE POLICY "Users can manage their own tag equivalences" ON public.tag_equivalences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all tag equivalences" ON public.tag_equivalences FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

-- RLS policies for supplier_configs
CREATE POLICY "Users can manage their own supplier configs" ON public.supplier_configs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all supplier configs" ON public.supplier_configs FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

-- RLS policies for product_unit_configs
CREATE POLICY "Users can manage their own product unit configs" ON public.product_unit_configs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all product unit configs" ON public.product_unit_configs FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_supplier_configs_updated_at
BEFORE UPDATE ON public.supplier_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_products_updated_at();

CREATE TRIGGER update_product_unit_configs_updated_at
BEFORE UPDATE ON public.product_unit_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_products_updated_at();