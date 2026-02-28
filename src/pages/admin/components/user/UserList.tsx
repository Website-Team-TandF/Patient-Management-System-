import React, { useEffect, useState } from 'react';
import { getUsers, updateUser, changePassword } from '../../../../services/api';
import type { User } from '../../../../services/mocks/userData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Key, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from 'react-hot-toast';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
  };

  const handleChangePasswordClick = (user: User) => {
    setChangingPasswordUser(user);
  };

  return (
    <Card>
      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.userRoles.map((role) => (
                      <Badge key={role} variant="outline" className="capitalize">{role}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {user.userRoles.includes('doctor') && (
                    <div className="text-sm text-muted-foreground">
                      <div>{user.departments?.join(', ')}</div>
                      <div>{user.specializations?.join(', ')}</div>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleChangePasswordClick(user)}>
                    <Key className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit User Dialog */}
      {editingUser && (
        <EditUserDialog 
          user={editingUser} 
          open={!!editingUser} 
          onOpenChange={(open) => !open && setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            fetchUsers();
          }}
        />
      )}

      {/* Change Password Dialog */}
      {changingPasswordUser && (
        <ChangePasswordDialog 
          user={changingPasswordUser} 
          open={!!changingPasswordUser} 
          onOpenChange={(open) => !open && setChangingPasswordUser(null)}
        />
      )}
    </Card>
  );
};

// Sub-components for Dialogs (kept in same file for simplicity, can be separated)

const EditUserDialog: React.FC<{
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}> = ({ user, open, onOpenChange, onSuccess }) => {
  const [formData, setFormData] = useState({
    ...user,
    // Convert arrays back to strings for the input fields for easier editing
    departmentsString: user.departments?.join(', ') || '',
    specializationsString: user.specializations?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData = {
        ...formData,
        departments: formData.departmentsString.split(',').map(s => s.trim()).filter(Boolean),
        specializations: formData.specializationsString.split(',').map(s => s.trim()).filter(Boolean),
      };
      
      // Remove temporary string fields
      const { departmentsString, specializationsString, ...finalData } = updateData as any;
      
      await updateUser(user.id, finalData);
      toast.success("User updated successfully");
      onSuccess();
    } catch (error) {
      toast.error("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input 
              value={formData.fullName} 
              onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
          </div>
          {user.userRoles.includes('doctor') && (
            <>
              <div className="space-y-2">
                <Label>Departments (comma separated)</Label>
                <Input 
                  value={formData.departmentsString} 
                  onChange={(e) => setFormData({...formData, departmentsString: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Specializations (comma separated)</Label>
                <Input 
                  value={formData.specializationsString} 
                  onChange={(e) => setFormData({...formData, specializationsString: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Consultation Fee</Label>
                <Input 
                  type="number"
                  value={formData.consultationFee} 
                  onChange={(e) => setFormData({...formData, consultationFee: Number(e.target.value)})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Extra Info</Label>
                <Input 
                  value={formData.extraLine} 
                  onChange={(e) => setFormData({...formData, extraLine: e.target.value})} 
                />
              </div>
            </>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ChangePasswordDialog: React.FC<{
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ user, open, onOpenChange }) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Manual validation for simplicity here, or reuse Zod schema
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!strongPasswordRegex.test(password)) {
      toast.error("Password must be strong (8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special)");
      return;
    }

    setLoading(true);
    try {
      await changePassword(user.id, password);
      toast.success("Password changed successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>Enter a new strong password for {user.fullName}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input 
              type="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <p className="text-xs text-muted-foreground">
              Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserList;
