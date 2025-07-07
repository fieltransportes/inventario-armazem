import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, Search, FileText, Tag } from 'lucide-react';
import { XMLTag, ParsedXMLData } from '../../types/tagMapping';
import { parseAdvancedXML } from '../../utils/advancedXMLParser';

const XMLTagExplorer: React.FC = () => {
  const [parsedData, setParsedData] = useState<ParsedXMLData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState<XMLTag | null>(null);
  const [groupByTag, setGroupByTag] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      const parsed = parseAdvancedXML(text, file.name);
      setParsedData(parsed);
    } catch (error) {
      console.error('Erro ao processar XML:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTags = parsedData?.allTags.filter(tag =>
    tag.tagName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.path.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const uniqueTagNames = [...new Set(parsedData?.allTags.map(tag => tag.tagName) || [])];
  
  const groupedTags = parsedData?.allTags.reduce((acc, tag) => {
    if (!acc[tag.tagName]) {
      acc[tag.tagName] = [];
    }
    acc[tag.tagName].push(tag);
    return acc;
  }, {} as Record<string, XMLTag[]>) || {};

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Explorador de Tags XML</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept=".xml"
                onChange={handleFileUpload}
                className="hidden"
                id="xml-upload"
              />
              <label htmlFor="xml-upload" className="cursor-pointer">
                <Button type="button" variant="outline" asChild disabled={isLoading}>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {isLoading ? 'Processando...' : 'Selecionar XML'}
                  </span>
                </Button>
              </label>
              {parsedData && (
                <Badge variant="secondary">{parsedData.fileName}</Badge>
              )}
            </div>

            {parsedData && (
              <>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <Input
                    placeholder="Buscar tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Resumo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p><strong>Total de Tags:</strong> {parsedData.allTags.length}</p>
                        <p><strong>Tags Únicas:</strong> {uniqueTagNames.length}</p>
                        <p><strong>Arquivo:</strong> {parsedData.fileName}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tags Mais Comuns</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {uniqueTagNames.slice(0, 10).map(tagName => {
                          const count = groupedTags[tagName]?.length || 0;
                          return (
                            <Badge 
                              key={tagName} 
                              variant="outline" 
                              className="text-xs cursor-pointer hover:bg-accent"
                              onClick={() => setSearchTerm(tagName)}
                            >
                              {tagName} ({count})
                            </Badge>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Filtros</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="groupByTag"
                            checked={groupByTag}
                            onChange={(e) => setGroupByTag(e.target.checked)}
                            className="rounded"
                          />
                          <label htmlFor="groupByTag" className="text-sm">
                            Agrupar por tag
                          </label>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSearchTerm('')}
                        >
                          Limpar Filtro
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Tag className="h-4 w-4" />
                      <span>Tags Encontradas</span>
                      <Badge variant="secondary">{filteredTags.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {groupByTag ? (
                        Object.entries(groupedTags)
                          .filter(([tagName]) => 
                            !searchTerm || 
                            tagName.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map(([tagName, tags]) => (
                            <div key={tagName} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary">{tagName}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {tags.length} ocorrência(s)
                                </span>
                              </div>
                              <div className="space-y-1 ml-4">
                                {tags.slice(0, 3).map((tag, index) => (
                                  <div key={index} className="text-sm">
                                    <span className="text-xs text-muted-foreground">{tag.path}</span>
                                    {tag.content && (
                                      <p className="text-xs truncate">
                                        {tag.content}
                                      </p>
                                    )}
                                  </div>
                                ))}
                                {tags.length > 3 && (
                                  <p className="text-xs text-muted-foreground">
                                    +{tags.length - 3} mais...
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                      ) : (
                        filteredTags.map((tag, index) => (
                          <div 
                            key={index} 
                            className="p-3 border rounded-lg cursor-pointer hover:bg-accent"
                            onClick={() => setSelectedTag(tag)}
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant="secondary">{tag.tagName}</Badge>
                              <span className="text-xs text-muted-foreground">{tag.path}</span>
                            </div>
                            {tag.content && (
                              <p className="text-sm truncate">
                                <strong>Conteúdo:</strong> {tag.content}
                              </p>
                            )}
                            {tag.attributes && Object.keys(tag.attributes).length > 0 && (
                              <div className="mt-1">
                                <span className="text-xs font-medium">Atributos:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {Object.entries(tag.attributes).map(([key, value]) => (
                                    <Badge key={key} variant="outline" className="text-xs">
                                      {key}="{value}"
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {selectedTag && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        Detalhes da Tag
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedTag(null)}
                        >
                          Fechar
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Nome:</label>
                          <p className="text-sm">{selectedTag.tagName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Caminho:</label>
                          <p className="text-sm font-mono text-muted-foreground">{selectedTag.path}</p>
                        </div>
                        {selectedTag.content && (
                          <div>
                            <label className="text-sm font-medium">Conteúdo:</label>
                            <p className="text-sm bg-muted p-2 rounded">{selectedTag.content}</p>
                          </div>
                        )}
                        {selectedTag.attributes && Object.keys(selectedTag.attributes).length > 0 && (
                          <div>
                            <label className="text-sm font-medium">Atributos:</label>
                            <div className="space-y-1 mt-1">
                              {Object.entries(selectedTag.attributes).map(([key, value]) => (
                                <div key={key} className="flex items-center space-x-2 text-sm">
                                  <span className="font-mono">{key}:</span>
                                  <span className="bg-muted px-2 py-1 rounded">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default XMLTagExplorer;