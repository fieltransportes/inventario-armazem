-- Create products table for registered products
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL, -- cProd from NFE
  ean_box TEXT, -- cEAN from NFE (código de barras CX/FD)
  ean_unit TEXT, -- cEANTrib from NFE (código de barras UN)
  name TEXT NOT NULL, -- xProd from NFE
  unit_per_box INTEGER, -- quantas unidades em uma caixa
  box_per_pallet INTEGER, -- quantas caixas em um palete
  base_unit TEXT NOT NULL DEFAULT 'UN', -- unidade base (UN, CX, PAL)
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, code)
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for products
CREATE POLICY "Users can view their own products" 
ON public.products 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own products" 
ON public.products 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" 
ON public.products 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" 
ON public.products 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can manage all products
CREATE POLICY "Admins can manage all products" 
ON public.products 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_products_updated_at();