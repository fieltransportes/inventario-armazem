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
  const [previewLines, setPreviewLines] = useState<string[]>([]);
  const [selectedMapping, setSelectedMapping] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        setFormData(prev => ({
          ...prev,
          fileName: file.name,
          content: content
        }));
        setPreviewLines(lines.slice(0, 10)); // Preview first 10 lines
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
              
              <div className="space-y-2">
                <Textarea
                  placeholder="Conteúdo do arquivo"
                  value={formData.content}
                  onChange={(e) => {
                    const content = e.target.value;
                    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
                    setFormData(prev => ({ ...prev, content }));
                    setPreviewLines(lines.slice(0, 10));
                  }}
                  rows={4}
                />
                {previewLines.length > 0 && (
                  <div className="bg-muted p-3 rounded-lg">
                    <label className="text-sm font-medium">Preview (primeiras 10 linhas):</label>
                    <div className="mt-2 space-y-1">
                      {previewLines.map((line, index) => (
                        <div key={index} className="text-xs font-mono bg-background p-1 rounded">
                          {index + 1}: {line}
                        </div>
                      ))}
                      {formData.content.split('\n').filter(l => l.trim()).length > 10 && (
                        <p className="text-xs text-muted-foreground">
                          +{formData.content.split('\n').filter(l => l.trim()).length - 10} linhas mais...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
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
              <div key={mapping.id} className="border rounded-lg">
                <div className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary">{mapping.fileName}</Badge>
                      <span>→</span>
                      <Badge variant="outline">{mapping.mappedToTag}</Badge>
                      <Badge variant={mapping.active ? "default" : "secondary"}>
                        {mapping.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    {mapping.description && (
                      <p className="text-sm text-muted-foreground mb-2">{mapping.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {mapping.content.split('\n').filter(l => l.trim()).length} linhas
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedMapping(selectedMapping === mapping.id ? null : mapping.id);
                      }}
                    >
                      {selectedMapping === mapping.id ? "Ocultar" : "Ver"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(mapping.id);
                        const lines = mapping.content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
                        setFormData({
                          fileName: mapping.fileName,
                          content: mapping.content,
                          mappedToTag: mapping.mappedToTag,
                          description: mapping.description
                        });
                        setPreviewLines(lines.slice(0, 10));
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdate(mapping.id, { active: !mapping.active })}
                    >
                      {mapping.active ? "Desativar" : "Ativar"}
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
                
                {selectedMapping === mapping.id && (
                  <div className="border-t p-4 bg-muted/50">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Conteúdo do arquivo:</label>
                        <div className="mt-2 max-h-32 overflow-y-auto bg-background p-3 rounded border">
                          {mapping.content.split('\n').map((line, index) => (
                            <div key={index} className="text-xs font-mono">
                              {index + 1}: {line || '(linha vazia)'}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Criado em: {new Date(mapping.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TextFileMappingManager;