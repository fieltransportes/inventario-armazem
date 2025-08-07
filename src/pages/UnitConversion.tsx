import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import UnitConversionManager from '@/components/unitConversion/UnitConversionManager';

const UnitConversion: React.FC = () => {
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<{code: string, name: string} | null>(null);

  const handleProductSelect = () => {
    if (productSearch.trim()) {
      setSelectedProduct({
        code: productSearch.trim(),
        name: `Produto ${productSearch.trim()}`
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configuração de Unidades</h1>
            <p className="text-muted-foreground">Configure as conversões de unidades por produto</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Selecionar Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="product-code">Código do Produto</Label>
                  <Input
                    id="product-code"
                    placeholder="Digite o código do produto..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleProductSelect()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleProductSelect}>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedProduct && (
            <UnitConversionManager 
              productCode={selectedProduct.code}
              productName={selectedProduct.name}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitConversion;