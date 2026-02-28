import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddUserForm from './AddUserForm';
import UserList from './UserList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const UserManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      
      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manage">Manage Users</TabsTrigger>
          <TabsTrigger value="add">Add New User</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manage" className="space-y-4">
          <UserList />
        </TabsContent>
        
        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
              <CardDescription>
                Create a new account for a Doctor, Receptionist, or Pharmacist.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddUserForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
