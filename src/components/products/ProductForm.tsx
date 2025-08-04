import React from 'react';
import { useForm } from 'react-hook-form';
import { ProductFormData } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      base_unit: 'UN',
      ...initialData,
    },
  });

  const baseUnit = watch('base_unit');

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? 'Editar Produto' : 'Cadastrar Produto'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Código do Produto (cProd) *</Label>
              <Input
                id="code"
                {...register('code', { required: 'Código é obrigatório' })}
              />
              {errors.code && (
                <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="name">Nome do Produto (xProd) *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Nome é obrigatório' })}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="ean_box">Código de Barras CX/FD (cEAN)</Label>
              <Input
                id="ean_box"
                {...register('ean_box')}
                placeholder="Código de barras da caixa/fardo"
              />
            </div>

            <div>
              <Label htmlFor="ean_unit">Código de Barras UN (cEANTrib)</Label>
              <Input
                id="ean_unit"
                {...register('ean_unit')}
                placeholder="Código de barras da unidade"
              />
            </div>

            <div>
              <Label htmlFor="base_unit">Unidade Base *</Label>
              <Select
                value={baseUnit}
                onValueChange={(value) => setValue('base_unit', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UN">Unidade (UN)</SelectItem>
                  <SelectItem value="CX">Caixa (CX)</SelectItem>
                  <SelectItem value="PAL">Palete (PAL)</SelectItem>
                  <SelectItem value="KG">Quilograma (KG)</SelectItem>
                  <SelectItem value="PC">Peça (PC)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit_per_box">Unidades por Caixa</Label>
              <Input
                id="unit_per_box"
                type="number"
                {...register('unit_per_box', { 
                  valueAsNumber: true,
                  min: { value: 1, message: 'Deve ser maior que 0' }
                })}
                placeholder="Ex: 12 (12 UN = 1 CX)"
              />
              {errors.unit_per_box && (
                <p className="text-sm text-red-500 mt-1">{errors.unit_per_box.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="box_per_pallet">Caixas por Palete</Label>
              <Input
                id="box_per_pallet"
                type="number"
                {...register('box_per_pallet', { 
                  valueAsNumber: true,
                  min: { value: 1, message: 'Deve ser maior que 0' }
                })}
                placeholder="Ex: 90 (90 CX = 1 PAL)"
              />
              {errors.box_per_pallet && (
                <p className="text-sm text-red-500 mt-1">{errors.box_per_pallet.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Informações adicionais sobre o produto"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Produto'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;