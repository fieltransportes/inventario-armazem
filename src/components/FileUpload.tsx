
import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { parseNFEXML } from '../utils/nfeParser';
import { saveNFEData } from '../utils/storage';
import { NFEData } from '../types/nfe';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onUploadSuccess: (nfeData: NFEData) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.xml')) {
      toast({
        title: "Invalid file type",
        description: "Please select an XML file.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const content = await file.text();
      const nfeData = parseNFEXML(content, file.name);
      saveNFEData(nfeData);
      onUploadSuccess(nfeData);
      
      toast({
        title: "Success!",
        description: `NFE ${nfeData.number} imported successfully.`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to process the XML file.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onUploadSuccess, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          {isProcessing ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          ) : (
            <Upload className="h-12 w-12 text-gray-400" />
          )}
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              {isProcessing ? 'Processing NFE XML...' : 'Upload NFE XML Files'}
            </h3>
            <p className="text-sm text-gray-500">
              Drag and drop your XML files here, or click to select files
            </p>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FileText className="h-4 w-4" />
            <span>Supports XML files only</span>
          </div>

          <input
            type="file"
            accept=".xml"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            disabled={isProcessing}
          />
          
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors duration-200"
          >
            Select Files
          </label>
        </div>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Supported NFE XML format</p>
            <p className="mt-1">
              This system supports standard Brazilian NFE XML files. Make sure your XML files contain proper NFE structure with product, seller, and buyer information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
