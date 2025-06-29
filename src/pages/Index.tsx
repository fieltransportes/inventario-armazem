
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Upload, FileText, BarChart3 } from 'lucide-react';
import Navbar from '@/components/Navbar';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Upload,
      title: 'Upload de NFEs',
      description: 'Faça upload dos arquivos XML das suas notas fiscais eletrônicas',
      action: () => navigate('/'),
      actionText: 'Fazer Upload'
    },
    {
      icon: Package,
      title: 'Inventário de Produtos',
      description: 'Crie e gerencie inventários com base nos produtos das NFEs',
      action: () => navigate('/inventory'),
      actionText: 'Criar Inventário'
    },
    {
      icon: FileText,
      title: 'Relatórios',
      description: 'Gere relatórios detalhados dos seus inventários',
      action: () => {},
      actionText: 'Ver Relatórios'
    },
    {
      icon: BarChart3,
      title: 'Dashboard',
      description: 'Visualize estatísticas e métricas dos seus dados',
      action: () => {},
      actionText: 'Abrir Dashboard'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Inventário
          </h1>
          <p className="text-xl text-gray-600">
            Gerencie seus inventários de forma eficiente e organizada
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                  <span>{feature.title}</span>
                </CardTitle>
                <CardDescription>
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={feature.action}
                  className="w-full"
                >
                  {feature.actionText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
