import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProductData, ProductFormData } from '@/types/product';
import { useToast } from '@/hooks/use-toast';

export const useProducts = () => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: ProductFormData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Produto cadastrado com sucesso",
      });
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar produto",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: Partial<ProductFormData>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === id ? data : p));
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso",
      });
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar produto",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir produto",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createProductFromNFE = async (nfeProduct: any): Promise<void> => {
    const productData: ProductFormData = {
      code: nfeProduct.code || nfeProduct.id,
      ean_box: nfeProduct.ean_box,
      ean_unit: nfeProduct.ean_unit,
      name: nfeProduct.name,
      base_unit: nfeProduct.unit || 'UN',
    };

    await createProduct(productData);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductFromNFE,
  };
};