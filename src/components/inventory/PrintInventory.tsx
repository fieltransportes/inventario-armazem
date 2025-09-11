
import React from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useUnitConversion } from '@/hooks/useUnitConversion';

interface InventoryItem {
  name: string;
  code?: string;
  totalQuantity: number;
  totalValue: number;
  unit: string;
  occurrences: number;
}

interface PrintInventoryProps {
  inventorySummary: InventoryItem[];
  searchFilters: Array<{ id: string; type: 'number' | 'chave'; value: string }>;
  showUnitized?: boolean;
  showQuantities?: boolean;
}

const PrintInventory: React.FC<PrintInventoryProps> = ({ inventorySummary, searchFilters, showUnitized = false, showQuantities = true }) => {
  const { convertQuantity } = useUnitConversion();

  const formatQuantity = (quantity: number, unit: string, productCode?: string) => {
    if (showUnitized && productCode) {
      return convertQuantity(quantity, unit, productCode);
    }
    return `${quantity.toLocaleString('pt-BR')} ${unit}`;
  };

  const handlePrint = () => {
    // Processar os dados antes de gerar o HTML
    const processedItems = inventorySummary.map(item => ({
      ...item,
      displayQuantity: formatQuantity(item.totalQuantity, item.unit, item.code)
    }));

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Inventário</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; margin-bottom: 30px; }
            h2 { color: #666; margin-top: 30px; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .filters { background-color: #f9f9f9; padding: 15px; margin: 20px 0; }
            .date { text-align: right; margin-bottom: 20px; color: #666; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="date">Data: ${new Date().toLocaleDateString('pt-BR')}</div>
          <h1>Relatório de Inventário</h1>
          
           <div class="filters">
            <h2>Filtros Aplicados:</h2>
            ${searchFilters.map(filter => 
              `<p>• ${filter.type === 'number' ? 'NFE' : 'Chave de Acesso'}: ${filter.value}</p>`
            ).join('')}
            ${showUnitized ? '<p>• <strong>Relatório Unitizado</strong> - Quantidades convertidas para embalagens</p>' : ''}
          </div>

          <h2>Resumo do Inventário por Produto</h2>
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th class="text-right">Quantidade Total</th>
                <th class="text-center">Ocorrências</th>
              </tr>
            </thead>
            <tbody>
              ${processedItems.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td class="text-right">${showQuantities ? item.displayQuantity : ''}</td>
                  <td class="text-center">${item.occurrences} NFE${item.occurrences > 1 ? 's' : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="margin-top: 50px; font-size: 12px; color: #666;">
            <p>Total de produtos únicos: ${inventorySummary.length}</p>
            <p>Relatório gerado em: ${new Date().toLocaleString('pt-BR')}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Printer className="h-4 w-4" />
          <span>Imprimir Inventário</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Imprimir Relatório de Inventário</DialogTitle>
        </DialogHeader>
         <div className="space-y-4">
          <p>Este relatório incluirá:</p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Filtros aplicados na busca</li>
            <li>Resumo de todos os produtos encontrados</li>
            <li>Quantidades totais por produto{showUnitized ? ' (convertidas para embalagens)' : ''}</li>
            <li>Número de ocorrências por produto</li>
            <li>Data e hora de geração do relatório</li>
            {showUnitized && <li className="font-medium text-blue-600">Modo unitizado ativo - quantidades serão convertidas conforme configuração de embalagens</li>}
          </ul>
          <div className="flex justify-end space-x-2 pt-4">
            <Button onClick={handlePrint} className="flex items-center space-x-2">
              <Printer className="h-4 w-4" />
              <span>Imprimir</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintInventory;
