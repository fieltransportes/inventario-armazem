-- Criar tabela para unidades customizadas
CREATE TABLE public.custom_units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('primary', 'secondary', 'pallet')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, code)
);

-- Enable RLS
ALTER TABLE public.custom_units ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para custom_units
CREATE POLICY "Users can view their own custom units" 
ON public.custom_units 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom units" 
ON public.custom_units 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom units" 
ON public.custom_units 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom units" 
ON public.custom_units 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins podem ver todas as unidades customizadas
CREATE POLICY "Admins can view all custom units" 
ON public.custom_units 
FOR ALL
USING (get_user_role(auth.uid()) = 'admin');

-- Trigger para updated_at
CREATE TRIGGER update_custom_units_updated_at
BEFORE UPDATE ON public.custom_units
FOR EACH ROW
EXECUTE FUNCTION public.update_products_updated_at();