import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit } from 'lucide-react';
import { TagEquivalence } from '../../types/tagMapping';

interface TagEquivalenceManagerProps {
  tagEquivalences: TagEquivalence[];
  onAdd: (equivalence: Omit<TagEquivalence, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<TagEquivalence>) => void;
  onDelete: (id: string) => void;
}

const TagEquivalenceManager: React.FC<TagEquivalenceManagerProps> = ({
  tagEquivalences,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    primaryTag: '',
    equivalentTags: '',
    description: ''
  });

  const handleSubmit = () => {
    if (!formData.primaryTag || !formData.equivalentTags) return;

    const equivalentTagsArray = formData.equivalentTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const equivalence = {
      primaryTag: formData.primaryTag,
      equivalentTags: equivalentTagsArray,
      description: formData.description,
      active: true
    };

    if (editingId) {
      onUpdate(editingId, equivalence);
      setEditingId(null);
    } else {
      onAdd(equivalence);
    }

    setFormData({ primaryTag: '', equivalentTags: '', description: '' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Equivalências de Tags
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Equivalência
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(isAdding || editingId) && (
            <div className="space-y-4 mb-6 p-4 border rounded-lg">
              <Input
                placeholder="Tag principal (ex: pedido)"
                value={formData.primaryTag}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryTag: e.target.value }))}
              />
              <Input
                placeholder="Tags equivalentes (ex: nPedido,numPedido,orderNumber)"
                value={formData.equivalentTags}
                onChange={(e) => setFormData(prev => ({ ...prev, equivalentTags: e.target.value }))}
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
                  setFormData({ primaryTag: '', equivalentTags: '', description: '' });
                }}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {tagEquivalences.map((equiv) => (
              <div key={equiv.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="secondary">{equiv.primaryTag}</Badge>
                    <span>→</span>
                    {equiv.equivalentTags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                  {equiv.description && (
                    <p className="text-sm text-gray-600">{equiv.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(equiv.id);
                      setFormData({
                        primaryTag: equiv.primaryTag,
                        equivalentTags: equiv.equivalentTags.join(', '),
                        description: equiv.description
                      });
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(equiv.id)}
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

export default TagEquivalenceManager;