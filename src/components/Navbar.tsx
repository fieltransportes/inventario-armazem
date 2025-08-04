
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User, Users, Package, Settings, Archive } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, isAdmin, isManager } = useAuthContext();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Package className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Sistema de Inventário</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/products')}
            >
              <Archive className="h-4 w-4 mr-2" />
              Produtos
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/tag-mapping')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Parametrização
            </Button>
            
            {(isAdmin || isManager) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/users')}
              >
                <Users className="h-4 w-4 mr-2" />
                Gerenciar Usuários
              </Button>
            )}
            
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {profile?.full_name || user.email}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
