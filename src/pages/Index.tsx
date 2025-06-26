
import React, { useState, useEffect } from 'react';
import { FileText, Upload, Database, BarChart3 } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import NFEList from '../components/NFEList';
import NFEDetails from '../components/NFEDetails';
import { NFEData } from '../types/nfe';
import { getNFEData } from '../utils/storage';

const Index = () => {
  const [nfeData, setNfeData] = useState<NFEData[]>([]);
  const [selectedNFE, setSelectedNFE] = useState<NFEData | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'list'>('upload');

  useEffect(() => {
    loadNFEData();
  }, []);

  const loadNFEData = () => {
    const data = getNFEData();
    setNfeData(data);
    if (data.length > 0 && activeTab === 'upload') {
      setActiveTab('list');
    }
  };

  const handleUploadSuccess = (newNFE: NFEData) => {
    setNfeData(prevData => [...prevData, newNFE]);
    setActiveTab('list');
  };

  const handleViewDetails = (nfe: NFEData) => {
    setSelectedNFE(nfe);
  };

  const handleCloseDetails = () => {
    setSelectedNFE(null);
  };

  const totalValue = nfeData.reduce((sum, nfe) => sum + nfe.totalValue, 0);
  const totalProducts = nfeData.reduce((sum, nfe) => sum + nfe.products.length, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">NFE Storage System</h1>
                <p className="text-sm text-gray-500">Import and manage your NFE XML files</p>
              </div>
            </div>
            
            {nfeData.length > 0 && (
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{nfeData.length}</div>
                  <div className="text-xs text-gray-500">NFEs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{totalProducts}</div>
                  <div className="text-xs text-gray-500">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{formatCurrency(totalValue)}</div>
                  <div className="text-xs text-gray-500">Total Value</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Upload NFE</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>NFE List ({nfeData.length})</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Import NFE XML Files
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Upload your Brazilian NFE (Nota Fiscal Eletrônica) XML files to extract and store 
                product information, quantities, prices, and seller details automatically.
              </p>
            </div>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {activeTab === 'list' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Imported NFE Files
              </h2>
              <button
                onClick={() => setActiveTab('upload')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import New NFE
              </button>
            </div>
            
            <NFEList 
              nfeData={nfeData}
              onRefresh={loadNFEData}
              onViewDetails={handleViewDetails}
            />
          </div>
        )}
      </div>

      {/* NFE Details Modal */}
      {selectedNFE && (
        <NFEDetails
          nfe={selectedNFE}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default Index;
