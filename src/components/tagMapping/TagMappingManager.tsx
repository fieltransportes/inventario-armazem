import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, FileText, ArrowLeftRight, Upload } from 'lucide-react';
import { useTagMapping } from '../../hooks/useTagMapping';
import TagEquivalenceManager from './TagEquivalenceManager';
import TextFileMappingManager from './TextFileMappingManager';
import XMLTagExplorer from './XMLTagExplorer';

const TagMappingManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('equivalences');
  const tagMappingHook = useTagMapping();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Tags e Mapeamentos</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="equivalences" className="flex items-center space-x-2">
            <ArrowLeftRight className="h-4 w-4" />
            <span>Equivalências</span>
          </TabsTrigger>
          <TabsTrigger value="textfiles" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Arquivos TXT</span>
          </TabsTrigger>
          <TabsTrigger value="explorer" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Explorar XML</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equivalences">
          <TagEquivalenceManager 
            tagEquivalences={tagMappingHook.tagEquivalences}
            onAdd={tagMappingHook.addTagEquivalence}
            onUpdate={tagMappingHook.updateTagEquivalence}
            onDelete={tagMappingHook.deleteTagEquivalence}
          />
        </TabsContent>

        <TabsContent value="textfiles">
          <TextFileMappingManager 
            textFileMappings={tagMappingHook.textFileMappings}
            onAdd={tagMappingHook.addTextFileMapping}
            onUpdate={tagMappingHook.updateTextFileMapping}
            onDelete={tagMappingHook.deleteTextFileMapping}
          />
        </TabsContent>

        <TabsContent value="explorer">
          <XMLTagExplorer />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Total de Equivalências</h3>
                    <p className="text-sm text-gray-500">
                      {tagMappingHook.tagEquivalences.length} equivalências configuradas
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Arquivos TXT Mapeados</h3>
                    <p className="text-sm text-gray-500">
                      {tagMappingHook.textFileMappings.length} arquivos configurados
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (confirm('Tem certeza que deseja limpar todas as configurações?')) {
                      localStorage.removeItem('tagMappings');
                      localStorage.removeItem('textFileMappings');
                      localStorage.removeItem('tagEquivalences');
                      window.location.reload();
                    }
                  }}
                >
                  Limpar Todas as Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TagMappingManager;