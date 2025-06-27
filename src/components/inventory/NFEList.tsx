
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { NFEData } from '../../types/nfe';

interface NFEListProps {
  nfes: NFEData[];
}

const NFEList: React.FC<NFEListProps> = ({ nfes }) => {
  const formatQuantity = (quantity: number, unit: string) => {
    return `${quantity.toLocaleString('pt-BR')} ${unit}`;
  };

  return (
    <div className="space-y-4">
      {nfes.map((nfe) => (
        <Card key={nfe.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>NFE {nfe.number} - Série {nfe.series}</span>
              <Badge variant="secondary">{nfe.products.length} produtos</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p><strong>Fornecedor:</strong> {nfe.seller.name}</p>
                <p><strong>Data:</strong> {new Date(nfe.issueDate).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <p><strong>Chave:</strong> {nfe.chNFe.substring(0, 8)}...{nfe.chNFe.substring(-8)}</p>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nfe.products.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-right">
                      {formatQuantity(product.quantity, product.unit)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NFEList;
