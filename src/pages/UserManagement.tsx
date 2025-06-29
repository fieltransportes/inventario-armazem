
import React from 'react';
import Navbar from '@/components/Navbar';
import UserManagement from '@/components/UserManagement';

const UserManagementPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <UserManagement />
      </div>
    </div>
  );
};

export default UserManagementPage;
