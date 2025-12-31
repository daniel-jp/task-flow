import { useEffect, useState } from 'react';
import { getAllUsers, User, deleteUser } from '@/services/auth.service';
import { getAllRoles, assignRoleToUser, removeRoleFromUser } from '@/services/role.service';
import { Role } from '@/services/auth.service';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, UserPlus, Shield, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, rolesData] = await Promise.all([getAllUsers(), getAllRoles()]);
        setUsers(usersData);
        setRoles(rolesData);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load users and roles.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await deleteUser(userId);
      setUsers(users.filter((u) => u.id !== userId));
      toast({ title: 'User deleted successfully' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete user.',
      });
    }
  };

  const handleOpenRoleDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedRoleId('');
    setIsRoleDialogOpen(true);
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRoleId) return;

    setProcessing(true);
    try {
      await assignRoleToUser(selectedUser.id, selectedRoleId);
      const assignedRole = roles.find((r) => r.id === selectedRoleId);
      if (assignedRole) {
        setUsers(
          users.map((u) =>
            u.id === selectedUser.id
              ? { ...u, roles: [...(u.roles || []), assignedRole] }
              : u
          )
        );
      }
      toast({ title: 'Role assigned successfully' });
      setIsRoleDialogOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to assign role.',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveRole = async (userId: string, roleId: string) => {
    try {
      await removeRoleFromUser(userId, roleId);
      setUsers(
        users.map((u) =>
          u.id === userId
            ? { ...u, roles: u.roles?.filter((r) => r.id !== roleId) || [] }
            : u
        )
      );
      toast({ title: 'Role removed successfully' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove role.',
      });
    }
  };

  const getAvailableRoles = (user: User) => {
    const userRoleIds = user.roles?.map((r) => r.id) || [];
    return roles.filter((r) => !userRoleIds.includes(r.id));
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage users and their roles</p>
        </div>

        {/* Users table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.length ? (
                          user.roles.map((role) => (
                            <Badge
                              key={role.id}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <Shield className="h-3 w-3" />
                              {role.name}
                              <button
                                onClick={() => handleRemoveRole(user.id, role.id)}
                                className="ml-1 hover:text-destructive transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No roles</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRoleDialog(user)}
                          disabled={getAvailableRoles(user).length === 0}
                        >
                          <UserPlus className="mr-1 h-4 w-4" />
                          Add Role
                        </Button>
                        {user.id !== currentUser?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Assign role dialog */}
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Role to {selectedUser?.name}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {selectedUser &&
                    getAvailableRoles(selectedUser).map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAssignRole}
                className="gradient-primary"
                disabled={!selectedRoleId || processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign Role'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AdminUsers;
