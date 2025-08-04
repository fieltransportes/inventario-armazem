import React, { useState } from 'react';
import { ProductData, ProductFormData } from '@/types/product';
import { useProducts } from '@/hooks/useProducts';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import ProductFromNFE from './ProductFromNFE';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, FileText } from 'lucide-react';

const ProductManager: React.FC = () => {
  const {
    products,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductFromNFE,
  } = useProducts();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const handleSubmit = async (data: ProductFormData) => {
    setFormLoading(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
      } else {
        await createProduct(data);
      }
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      // Error handled in hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (product: ProductData) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setDeleteProductId(id);
  };

  const confirmDelete = async () => {
    if (deleteProductId) {
      await deleteProduct(deleteProductId);
      setDeleteProductId(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (showForm) {
    return (
      <ProductForm
        initialData={editingProduct || undefined}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={formLoading}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gerenciamento de Produtos</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Lista de Produtos</TabsTrigger>
          <TabsTrigger value="nfe">Cadastrar da NFE</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <ProductList
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </TabsContent>
        
        <TabsContent value="nfe">
          <ProductFromNFE onCreateProduct={createProductFromNFE} />
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductManager;