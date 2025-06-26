
import React from 'react';
import { NFEData } from '../types/nfe';
import { X, Building, User, MapPin, Package, DollarSign, Calendar, FileText } from 'lucide-react';

interface NFEDetailsProps {
  nfe: NFEData;
  onClose: () => void;
}

const NFEDetails: React.FC<NFEDetailsProps> = ({ nfe, onClose }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            NFE Details - {nfe.number}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-900">NFE Number</span>
              </div>
              <p className="text-lg font-semibold text-blue-900">{nfe.number}</p>
              <p className="text-sm text-blue-700">Series: {nfe.series}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium text-green-900">Issue Date</span>
              </div>
              <p className="text-lg font-semibold text-green-900">
                {formatDate(nfe.issueDate)}
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-medium text-purple-900">Total Value</span>
              </div>
              <p className="text-lg font-semibold text-purple-900">
                {formatCurrency(nfe.totalValue)}
              </p>
            </div>
          </div>

          {/* Seller Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Building className="h-6 w-6 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Seller Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Company Name</p>
                <p className="font-medium text-gray-900">{nfe.seller.name}</p>
                {nfe.seller.fantasyName && (
                  <>
                    <p className="text-sm text-gray-600 mt-2">Fantasy Name</p>
                    <p className="font-medium text-gray-900">{nfe.seller.fantasyName}</p>
                  </>
                )}
                <p className="text-sm text-gray-600 mt-2">CNPJ</p>
                <p className="font-medium text-gray-900">{nfe.seller.cnpj}</p>
              </div>
              <div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <div className="text-sm text-gray-900">
                      <p>{nfe.seller.address.street}, {nfe.seller.address.number}</p>
                      <p>{nfe.seller.address.neighborhood}</p>
                      <p>{nfe.seller.address.city}, {nfe.seller.address.state}</p>
                      <p>CEP: {nfe.seller.address.zipCode}</p>
                    </div>
                  </div>
                </div>
                {nfe.seller.email && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-sm text-gray-900">{nfe.seller.email}</p>
                  </div>
                )}
                {nfe.seller.phone && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-sm text-gray-900">{nfe.seller.phone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buyer Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <User className="h-6 w-6 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Buyer Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{nfe.buyer.name}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {nfe.buyer.cnpj ? 'CNPJ' : 'CPF'}
                </p>
                <p className="font-medium text-gray-900">
                  {nfe.buyer.cnpj || nfe.buyer.cpf}
                </p>
              </div>
              <div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <div className="text-sm text-gray-900">
                      <p>{nfe.buyer.address.street}, {nfe.buyer.address.number}</p>
                      <p>{nfe.buyer.address.neighborhood}</p>
                      <p>{nfe.buyer.address.city}, {nfe.buyer.address.state}</p>
                      <p>CEP: {nfe.buyer.address.zipCode}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Package className="h-6 w-6 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Products ({nfe.products.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NCM</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {nfe.products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">Unit: {product.unit}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {product.quantity.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {formatCurrency(product.unitPrice)}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(product.totalPrice)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {product.ncm || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Taxes */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">ICMS</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(nfe.taxes.icms)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">IPI</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(nfe.taxes.ipi)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">PIS</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(nfe.taxes.pis)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">COFINS</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(nfe.taxes.cofins)}
                </p>
              </div>
            </div>
          </div>

          {/* Import Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Import Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">File Name:</span>
                <span className="ml-2 text-blue-900">{nfe.fileName}</span>
              </div>
              <div>
                <span className="text-blue-700">Imported At:</span>
                <span className="ml-2 text-blue-900">
                  {new Date(nfe.importedAt).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFEDetails;
