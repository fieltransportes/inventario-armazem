import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Upload } from 'lucide-react';
import { TextFileMapping } from '../../types/tagMapping';

interface TextFileMappingManagerProps {
  textFileMappings: TextFileMapping[];
  onAdd: (mapping: Omit<TextFileMapping, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, updates: Partial<TextFileMapping>) => void;
  onDelete: (id: string) => void;
}

const TextFileMappingManager: React.FC<TextFileMappingManagerProps> = ({
  textFileMappings,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fileName: '',
    content: '',
    mappedToTag: '',
    description: ''
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFormData(prev => ({
          ...prev,
          fileName: file.name,
          content: content
        }));
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.fileName || !formData.content || !formData.mappedToTag) return;

    const mapping = {
      fileName: formData.fileName,
      content: formData.content,
      mappedToTag: formData.mappedToTag,
      description: formData.description,
      active: true
    };

    if (editingId) {
      onUpdate(editingId, mapping);
      setEditingId(null);
    } else {
      onAdd(mapping);
    }

    setFormData({ fileName: '', content: '', mappedToTag: '', description: '' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Mapeamentos de Arquivos TXT
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Mapeamento
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(isAdding || editingId) && (
            <div className="space-y-4 mb-6 p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Selecionar Arquivo TXT
                    </span>
                  </Button>
                </label>
                {formData.fileName && (
                  <Badge variant="secondary">{formData.fileName}</Badge>
                )}
              </div>
              
              <Input
                placeholder="Nome do arquivo"
                value={formData.fileName}
                onChange={(e) => setFormData(prev => ({ ...prev, fileName: e.target.value }))}
              />
              
              <Textarea
                placeholder="Conteúdo do arquivo"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
              />
              
              <Input
                placeholder="Tag XML de destino (ex: xProd)"
                value={formData.mappedToTag}
                onChange={(e) => setFormData(prev => ({ ...prev, mappedToTag: e.target.value }))}
              />
              
              <Textarea
                placeholder="Descrição (opcional)"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
              
              <div className="flex space-x-2">
                <Button onClick={handleSubmit}>Salvar</Button>
                <Button variant="outline" onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setFormData({ fileName: '', content: '', mappedToTag: '', description: '' });
                }}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {textFileMappings.map((mapping) => (
              <div key={mapping.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="secondary">{mapping.fileName}</Badge>
                    <span>→</span>
                    <Badge variant="outline">{mapping.mappedToTag}</Badge>
                  </div>
                  {mapping.description && (
                    <p className="text-sm text-gray-600 mb-2">{mapping.description}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {mapping.content.substring(0, 100)}...
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(mapping.id);
                      setFormData({
                        fileName: mapping.fileName,
                        content: mapping.content,
                        mappedToTag: mapping.mappedToTag,
                        description: mapping.description
                      });
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(mapping.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TextFileMappingManager;