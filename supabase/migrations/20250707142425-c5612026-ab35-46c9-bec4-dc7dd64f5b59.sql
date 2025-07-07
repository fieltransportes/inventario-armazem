-- Create storage bucket for inventory files
INSERT INTO storage.buckets (id, name, public) VALUES ('inventory-files', 'inventory-files', true);

-- Create table to map files to inventories
CREATE TABLE public.inventory_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id UUID NOT NULL REFERENCES public.inventories(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on inventory_files
ALTER TABLE public.inventory_files ENABLE ROW LEVEL SECURITY;

-- Create policies for inventory_files
CREATE POLICY "Users can view inventory files they have access to" 
ON public.inventory_files 
FOR SELECT 
USING (user_has_inventory_access(inventory_id, auth.uid()));

CREATE POLICY "Users can upload files to inventories they have access to" 
ON public.inventory_files 
FOR INSERT 
WITH CHECK (user_has_inventory_access(inventory_id, auth.uid()) AND auth.uid() = uploaded_by);

CREATE POLICY "Users can delete files from inventories they have access to" 
ON public.inventory_files 
FOR DELETE 
USING (user_has_inventory_access(inventory_id, auth.uid()));

-- Create storage policies for inventory files
CREATE POLICY "Inventory files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'inventory-files');

CREATE POLICY "Users can upload files to inventory bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'inventory-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own inventory files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'inventory-files' AND auth.uid()::text = (storage.foldername(name))[1]);