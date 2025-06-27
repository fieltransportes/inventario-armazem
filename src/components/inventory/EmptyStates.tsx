
import React from 'react';
import { Package, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStatesProps {
  type: 'initial' | 'no-results';
}

const EmptyStates: React.FC<EmptyStatesProps> = ({ type }) => {
  if (type === 'initial') {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Iniciar Inventário</h3>
          <p className="text-gray-600 mb-4">
            Adicione números de NFE ou chaves de acesso para filtrar os produtos do armazém
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="text-center py-12">
        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma NFE encontrada</h3>
        <p className="text-gray-600 mb-4">
          Verifique os filtros aplicados e tente novamente
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyStates;
