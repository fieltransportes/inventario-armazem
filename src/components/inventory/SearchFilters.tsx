
import React from 'react';
import { Search, FileText, Hash, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SearchFilter {
  id: string;
  type: 'number' | 'chave';
  value: string;
}

interface SearchFiltersProps {
  searchFilters: SearchFilter[];
  currentSearchTerm: string;
  searchType: 'number' | 'chave';
  onSearchTermChange: (value: string) => void;
  onSearchTypeChange: (type: 'number' | 'chave') => void;
  onAddFilter: () => void;
  onRemoveFilter: (filterId: string) => void;
  onClearAllFilters: () => void;
  resultsCount: { nfes: number; products: number };
  showUnitized?: boolean;
  onUnitizedToggle?: (value: boolean) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchFilters,
  currentSearchTerm,
  searchType,
  onSearchTermChange,
  onSearchTypeChange,
  onAddFilter,
  onRemoveFilter,
  onClearAllFilters,
  resultsCount,
  showUnitized = false,
  onUnitizedToggle
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onAddFilter();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Filtrar NFEs</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex space-x-2">
            <Button
              variant={searchType === 'number' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSearchTypeChange('number')}
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Número NFE</span>
            </Button>
            <Button
              variant={searchType === 'chave' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSearchTypeChange('chave')}
              className="flex items-center space-x-2"
            >
              <Hash className="h-4 w-4" />
              <span>Chave de Acesso</span>
            </Button>
          </div>
          <div className="flex flex-1 space-x-2">
            <Input
              type="text"
              placeholder={searchType === 'number' ? 'Digite o número da NFE...' : 'Digite a chave de acesso...'}
              value={currentSearchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={onAddFilter}
              disabled={!currentSearchTerm.trim()}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar</span>
            </Button>
          </div>
        </div>
        
        {/* Active Filters */}
        {searchFilters.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">Filtros ativos:</div>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAllFilters}
                className="text-red-600 hover:text-red-700"
              >
                Limpar todos
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchFilters.map((filter) => (
                <Badge
                  key={filter.id}
                  variant="secondary"
                  className="flex items-center space-x-2 px-3 py-1"
                >
                  <span className="text-xs font-medium">
                    {filter.type === 'number' ? 'NFE' : 'Chave'}:
                  </span>
                  <span className="max-w-[200px] truncate">{filter.value}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFilter(filter.id)}
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Unitized Toggle */}
        {searchFilters.length > 0 && onUnitizedToggle && (
          <div className="flex items-center space-x-2 pt-2 border-t">
            <Switch
              id="unitized-toggle"
              checked={showUnitized}
              onCheckedChange={(checked) => {
                console.log('Toggle changed:', checked);
                onUnitizedToggle?.(checked);
              }}
            />
            <Label htmlFor="unitized-toggle" className="text-sm font-medium">
              Unitizado
            </Label>
          </div>
        )}

        {/* Results Summary */}
        {searchFilters.length > 0 && (
          <div className="text-sm text-gray-600">
            {resultsCount.nfes > 0 ? (
              <>Encontradas {resultsCount.nfes} NFE(s) • {resultsCount.products} produto(s)</>
            ) : (
              <>Nenhuma NFE encontrada com os filtros aplicados</>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
