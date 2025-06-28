
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';

interface SaveInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchFilters: any[];
  inventorySummary: any[];
}

const SaveInventoryDialog: React.FC<SaveInventoryDialogProps> = ({
  open,
  onOpenChange,
  searchFilters,
  inventorySummary
}) => {
  const [notes, setNotes] = useState('');
  const { saveInventory, loading } = useInventory();

  const handleSave = async () => {
    try {
      await saveInventory(searchFilters, inventorySummary, notes);
      setNotes('');
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Save className="h-5 w-5" />
            <span>Salvar Inventário</span>
          </DialogTitle>
          <DialogDescription>
            Este inventário será salvo com um número único gerado automaticamente (aaaammddhhmmss).
            O time do armazém poderá então inserir as quantidades contadas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Produtos encontrados:</strong> {inventorySummary.length}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Filtros aplicados:</strong> {searchFilters.length}
            </p>
          </div>

          <div>
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre este inventário..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Inventário'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveInventoryDialog;
