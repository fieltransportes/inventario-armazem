import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus } from 'lucide-react';
import { useUnitConversion } from '@/hooks/useUnitConversion';
import { UnitConversion } from '@/types/unitConversion';

interface UnitConversionManagerProps {
  productCode: string;
  productName: string;
}

const UnitConversionManager: React.FC<UnitConversionManagerProps> = ({ productCode, productName }) => {
  const { 
    units, 
    getProductConfig, 
    addConversionToProduct, 
    removeConversion,
    convertQuantity,
    addCustomUnit
  } = useUnitConversion();

  const [newConversion, setNewConversion] = useState({
    from_unit: '',
    to_unit: '',
    conversion_factor: 1,
    category: 'secondary' as 'secondary' | 'pallet'
  });

  const [testQuantity, setTestQuantity] = useState<number>(24);
  const [showNewUnitDialog, setShowNewUnitDialog] = useState(false);
  const [newUnit, setNewUnit] = useState({
    code: '',
    name: '',
    category: 'primary' as 'primary' | 'secondary' | 'pallet'
  });

  const handleAddConversion = async () => {
    if (newConversion.from_unit && newConversion.to_unit && newConversion.conversion_factor > 0) {
      console.log('🔧 UnitConversionManager - Adding conversion:', {
        productCode,
        productName,
        conversion: newConversion
      });
      await addConversionToProduct(productCode, newConversion);
      setNewConversion({
        from_unit: '',
        to_unit: '',
        conversion_factor: 1,
        category: 'secondary'
      });
    }
  };

  const handleAddUnit = () => {
    if (newUnit.code && newUnit.name) {
      addCustomUnit(newUnit);
      setNewUnit({
        code: '',
        name: '',
        category: 'primary'
      });
      setShowNewUnitDialog(false);
    }
  };

  const config = getProductConfig(productCode);

  const getUnitsByCategory = (category: 'primary' | 'secondary' | 'pallet') => {
    return units.filter(unit => unit.category === category);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Conversões - {productName}</CardTitle>
          <p className="text-sm text-muted-foreground">Código: {productCode}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Conversões existentes */}
          {config && config.conversions.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Conversões Configuradas:</h4>
              <div className="space-y-2">
                 {config.conversions.map((conversion) => (
                   <div key={conversion.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 border rounded gap-2">
                     <div className="flex flex-wrap items-center gap-2">
                       <Badge variant="outline">{conversion.from_unit}</Badge>
                       <span>→</span>
                       <Badge variant="outline">{conversion.to_unit}</Badge>
                       <span className="text-sm text-muted-foreground">
                         ({conversion.conversion_factor} {conversion.from_unit} = 1 {conversion.to_unit})
                       </span>
                       <Badge variant={conversion.category === 'secondary' ? 'default' : 'secondary'}>
                         {conversion.category === 'secondary' ? 'Embalagem Secundária' : 'Paletização'}
                       </Badge>
                     </div>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => removeConversion(productCode, conversion.id)}
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* Adicionar nova conversão */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-4">Adicionar Nova Conversão:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="from-unit">Unidade Origem</Label>
                  <Select value={newConversion.from_unit} onValueChange={(value) => 
                    setNewConversion(prev => ({ ...prev, from_unit: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit.id} value={unit.code}>
                          {unit.code} - {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Dialog open={showNewUnitDialog} onOpenChange={setShowNewUnitDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Adicionar Nova Unidade</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="new-unit-code">Código da Unidade</Label>
                          <Input
                            id="new-unit-code"
                            value={newUnit.code}
                            onChange={(e) => setNewUnit(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                            placeholder="Ex: FD, BD, PCT"
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-unit-name">Nome da Unidade</Label>
                          <Input
                            id="new-unit-name"
                            value={newUnit.name}
                            onChange={(e) => setNewUnit(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ex: Fardo, Balde, Pacote"
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-unit-category">Categoria</Label>
                          <Select value={newUnit.category} onValueChange={(value: 'primary' | 'secondary' | 'pallet') => 
                            setNewUnit(prev => ({ ...prev, category: value }))
                          }>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="primary">Primária</SelectItem>
                              <SelectItem value="secondary">Embalagem Secundária</SelectItem>
                              <SelectItem value="pallet">Paletização</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setShowNewUnitDialog(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleAddUnit}>
                            Adicionar Unidade
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div>
                <Label htmlFor="to-unit">Unidade Destino</Label>
                <Select value={newConversion.to_unit} onValueChange={(value) => 
                  setNewConversion(prev => ({ ...prev, to_unit: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {newConversion.category === 'secondary' && 
                      getUnitsByCategory('secondary').map(unit => (
                        <SelectItem key={unit.id} value={unit.code}>
                          {unit.code} - {unit.name}
                        </SelectItem>
                      ))
                    }
                    {newConversion.category === 'pallet' && 
                      getUnitsByCategory('pallet').map(unit => (
                        <SelectItem key={unit.id} value={unit.code}>
                          {unit.code} - {unit.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="factor">Fator de Conversão</Label>
                <Input
                  id="factor"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={newConversion.conversion_factor}
                  onChange={(e) => setNewConversion(prev => ({ 
                    ...prev, 
                    conversion_factor: parseFloat(e.target.value) || 1 
                  }))}
                  placeholder="Ex: 4.8"
                />
              </div>

              <div>
                <Label htmlFor="category">Tipo</Label>
                <Select value={newConversion.category} onValueChange={(value: 'secondary' | 'pallet') => 
                  setNewConversion(prev => ({ ...prev, category: value, to_unit: '' }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="secondary">Embalagem Secundária</SelectItem>
                    <SelectItem value="pallet">Paletização</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={handleAddConversion} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>

          {/* Teste de conversão */}
          {config && config.conversions.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Teste de Conversão:</h4>
              <div className="flex items-center gap-4">
                <div>
                  <Label htmlFor="test-quantity">Quantidade para testar:</Label>
                  <Input
                    id="test-quantity"
                    type="number"
                    value={testQuantity}
                    onChange={(e) => setTestQuantity(parseInt(e.target.value) || 0)}
                    className="w-32"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span>Resultado:</span>
                  <Badge variant="secondary">
                    {convertQuantity(testQuantity, config.base_unit || 'UN', productCode)}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnitConversionManager;