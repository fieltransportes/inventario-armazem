
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, User, FileText, Package, Printer, Eye, EyeOff } from 'lucide-react';
import { NFEData } from '@/types/nfe';

interface DeliveryGroup {
  seller: string;
  sellerCnpj: string;
  buyer: string;
  buyerDoc: string;
  orderNumber: string | null;
  nfes: NFEData[];
  totalProducts: number;
  totalValue: number;
  products: Array<{
    name: string;
    quantity: number;
    unit: string;
    totalPrice: number;
    nfeNumber: string;
    unitPrice: number;
    id: string; // Product code/ID
  }>;
}

interface DeliveryGroupingProps {
  filteredNFEs: NFEData[];
}

const DeliveryGrouping: React.FC<DeliveryGroupingProps> = ({ filteredNFEs }) => {
  const [showQuantities, setShowQuantities] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  // Helper function to remove leading zeros
  const removeLeadingZeros = (value: string): string => {
    if (!value) return value;
    return value.replace(/^0+/, '') || '0';
  };

  const deliveryGroups = useMemo(() => {
    const groups = new Map<string, DeliveryGroup>();
    
    filteredNFEs.forEach(nfe => {
      const key = `${nfe.seller.cnpj}-${nfe.buyer.cnpj || nfe.buyer.cpf}-${nfe.pedidoDT || 'sem-pedido'}`;
      
      if (groups.has(key)) {
        const existing = groups.get(key)!;
        existing.nfes.push(nfe);
        existing.totalProducts += nfe.products.length;
        existing.totalValue += nfe.totalValue;
        
        // Add products to the group
        nfe.products.forEach(product => {
          existing.products.push({
            name: product.name,
            quantity: product.quantity,
            unit: product.unit,
            totalPrice: product.totalPrice,
            nfeNumber: nfe.number,
            unitPrice: product.unitPrice,
            id: product.id // Este é o código da tag cProd
          });
        });
      } else {
        groups.set(key, {
          seller: nfe.seller.name,
          sellerCnpj: nfe.seller.cnpj,
          buyer: nfe.buyer.name,
          buyerDoc: nfe.buyer.cnpj || nfe.buyer.cpf || '',
          orderNumber: nfe.pedidoDT || null,
          nfes: [nfe],
          totalProducts: nfe.products.length,
          totalValue: nfe.totalValue,
          products: nfe.products.map(product => ({
            name: product.name,
            quantity: product.quantity,
            unit: product.unit,
            totalPrice: product.totalPrice,
            nfeNumber: nfe.number,
            unitPrice: product.unitPrice,
            id: product.id // Este é o código da tag cProd
          }))
        });
      }
    });
    
    return Array.from(groups.values()).sort((a, b) => {
      // Sort by seller first, then buyer, then order number
      if (a.seller !== b.seller) return a.seller.localeCompare(b.seller);
      if (a.buyer !== b.buyer) return a.buyer.localeCompare(b.buyer);
      if (a.orderNumber && b.orderNumber) return a.orderNumber.localeCompare(b.orderNumber);
      if (a.orderNumber && !b.orderNumber) return -1;
      if (!a.orderNumber && b.orderNumber) return 1;
      return 0;
    });
  }, [filteredNFEs]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatQuantity = (quantity: number, unit: string) => {
    return `${quantity.toLocaleString('pt-BR')} ${unit}`;
  };

  const toggleGroupExpansion = (index: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedGroups(newExpanded);
  };

  const handlePrintDeliveries = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Entregas</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 15px; 
              font-size: 14px;
              line-height: 1.4;
            }
            h1 { 
              color: #333; 
              text-align: center; 
              margin-bottom: 20px; 
              font-size: 22px;
              font-weight: bold;
            }
            h2 { 
              color: #666; 
              margin: 20px 0 12px 0; 
              font-size: 16px;
              font-weight: bold;
            }
            h3 { 
              color: #555; 
              margin: 15px 0 8px 0; 
              font-size: 15px;
              font-weight: bold;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 12px 0; 
              font-size: 13px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 6px 8px; 
              text-align: left; 
              vertical-align: top;
            }
            th { 
              background-color: #f5f5f5; 
              font-weight: bold; 
              font-size: 12px;
              text-transform: uppercase;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .delivery-header { 
              background-color: #f9f9f9; 
              padding: 12px 16px; 
              margin: 15px 0 12px 0; 
              border-left: 4px solid #3b82f6;
              font-size: 13px;
            }
            .delivery-header p {
              margin: 3px 0;
              line-height: 1.3;
            }
            .delivery-header strong {
              font-weight: bold;
            }
            .date { 
              text-align: right; 
              margin-bottom: 15px; 
              color: #666; 
              font-size: 12px;
            }
            .page-break { 
              page-break-before: always; 
            }
            .blank-space { 
              width: 80px; 
              border-bottom: 1px solid #333; 
              display: inline-block; 
              height: 16px;
            }
            .compact-row td {
              padding: 4px 6px;
              font-size: 12px;
            }
            .product-name {
              max-width: 250px;
              word-wrap: break-word;
              font-size: 12px;
            }
            .product-code {
              font-family: monospace;
              font-size: 11px;
              color: #666;
            }
            .footer-info {
              margin-top: 25px; 
              font-size: 12px; 
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 12px;
            }
            @media print {
              .no-print { display: none; }
              body { margin: 10px; }
              .page-break { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <div class="date">Data: ${new Date().toLocaleDateString('pt-BR')}</div>
          <h1>Relatório de Entregas</h1>
          
          ${deliveryGroups.map((group, index) => `
            <div class="delivery-header">
              <p><strong>Entrega #${index + 1}${group.orderNumber ? ` - Pedido: ${removeLeadingZeros(group.orderNumber)}` : ''}</strong></p>
              <p><strong>Remetente:</strong> ${group.seller} (${group.sellerCnpj})</p>
              <p><strong>Destinatário:</strong> ${group.buyer} (${group.buyerDoc.length === 11 ? 'CPF' : 'CNPJ'}: ${group.buyerDoc})</p>
              <p><strong>NFEs:</strong> ${group.nfes.map(nfe => `${nfe.number}`).join(', ')} | <strong>Produtos:</strong> ${group.products.length}</p>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th style="width: 15%;">Código</th>
                  <th style="width: 40%;">Produto</th>
                  <th style="width: 12%;" class="text-center">NFE</th>
                  <th style="width: 18%;" class="${showQuantities ? 'text-right' : 'text-center'}">Quantidade</th>
                  <th style="width: 15%;" class="text-center">Ocorrência</th>
                </tr>
              </thead>
              <tbody>
                ${group.products.map(product => `
                  <tr class="compact-row">
                    <td class="product-code">${removeLeadingZeros(product.id)}</td>
                    <td class="product-name">${product.name}</td>
                    <td class="text-center">${product.nfeNumber}</td>
                    <td class="${showQuantities ? 'text-right' : 'text-center'}">${showQuantities ? formatQuantity(product.quantity, product.unit) : '________'}</td>
                    <td class="text-center"><span class="blank-space"></span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `).join('')}
          
          <div class="footer-info">
            <p><strong>Total de entregas:</strong> ${deliveryGroups.length} | <strong>Relatório gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
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

  if (deliveryGroups.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma entrega encontrada</h3>
        <p className="text-gray-500">Aplique filtros para ver os agrupamentos por entrega.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {deliveryGroups.length} entrega(s) agrupada(s)
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQuantities(!showQuantities)}
            className="flex items-center space-x-2"
          >
            {showQuantities ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showQuantities ? 'Ocultar Qtd.' : 'Mostrar Qtd.'}</span>
          </Button>
          
          <Button
            onClick={handlePrintDeliveries}
            className="flex items-center space-x-2"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir Entregas</span>
          </Button>
        </div>
      </div>
      
      {deliveryGroups.map((group, index) => (
        <Card key={index} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Entrega #{index + 1}</span>
                {group.orderNumber && (
                  <Badge variant="secondary" className="ml-2">
                    Pedido: {removeLeadingZeros(group.orderNumber)}
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {group.nfes.length} NFE(s) • {group.totalProducts} produto(s)
                </div>
                <div className="font-semibold text-green-600">
                  {formatCurrency(group.totalValue)}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sender Information */}
            <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
              <Building className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Remetente</div>
                <div className="text-sm text-gray-700">{group.seller}</div>
                <div className="text-xs text-gray-500">CNPJ: {group.sellerCnpj}</div>
              </div>
            </div>

            {/* Recipient Information */}
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <User className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Destinatário</div>
                <div className="text-sm text-gray-700">{group.buyer}</div>
                <div className="text-xs text-gray-500">
                  {group.buyerDoc.length === 11 ? 'CPF' : 'CNPJ'}: {group.buyerDoc}
                </div>
              </div>
            </div>

            {/* NFEs in this group */}
            <div className="space-y-2">
              <div className="font-medium text-gray-900 text-sm">NFEs desta entrega:</div>
              <div className="flex flex-wrap gap-2">
                {group.nfes.map(nfe => (
                  <Badge key={nfe.id} variant="outline" className="text-xs">
                    NFE {nfe.number} • {new Date(nfe.issueDate).toLocaleDateString('pt-BR')}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Products Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-900 text-sm">
                  Produtos ({group.products.length}):
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleGroupExpansion(index)}
                  className="text-xs"
                >
                  {expandedGroups.has(index) ? 'Ocultar' : 'Mostrar'} Produtos
                </Button>
              </div>
              
              {expandedGroups.has(index) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Código</th>
                          <th className="text-left py-2">Produto</th>
                          <th className="text-center py-2">NFE</th>
                          <th className="text-right py-2">Quantidade</th>
                          <th className="text-center py-2">Ocorrência</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.products.map((product, productIndex) => (
                          <tr key={productIndex} className="border-b border-gray-200">
                            <td className="py-2 text-gray-600 font-mono text-xs">{removeLeadingZeros(product.id)}</td>
                            <td className="py-2 text-gray-900">{product.name}</td>
                            <td className="py-2 text-center text-gray-600">{product.nfeNumber}</td>
                            <td className="py-2 text-right text-gray-900">
                              {showQuantities ? formatQuantity(product.quantity, product.unit) : '________'}
                            </td>
                            <td className="py-2 text-center">
                              <div className="w-16 h-6 border-b border-gray-400 mx-auto"></div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DeliveryGrouping;
