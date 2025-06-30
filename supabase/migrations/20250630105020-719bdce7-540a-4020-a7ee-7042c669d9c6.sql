
-- Criar tabela para armazenar NFEs
CREATE TABLE public.nfe_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ch_nfe TEXT NOT NULL UNIQUE,
  number TEXT NOT NULL,
  series TEXT NOT NULL,
  issue_date TIMESTAMP WITH TIME ZONE NOT NULL,
  seller JSONB NOT NULL,
  buyer JSONB NOT NULL,
  products JSONB NOT NULL,
  total_value NUMERIC(10,2),
  pedido_dt TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.nfe_data ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - usuários podem ver apenas seus próprios dados
CREATE POLICY "Users can view their own NFE data" 
  ON public.nfe_data 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own NFE data" 
  ON public.nfe_data 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own NFE data" 
  ON public.nfe_data 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own NFE data" 
  ON public.nfe_data 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Admins podem ver todos os dados
CREATE POLICY "Admins can view all NFE data" 
  ON public.nfe_data 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
