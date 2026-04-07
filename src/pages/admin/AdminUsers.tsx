import { useEffect, useState } from 'react';
import { getAllUsers, User, deleteUser, updateUser, getUserById, RegisterData, register, enableUser, disableUser, lockUser, unlockUser } from '@/services/auth.service';
import { getAllRoles, assignRoleToUser, removeRoleFromUser } from '@/services/role.service';
import { Role } from '@/services/auth.service';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, UserPlus, Shield, X, Eye, Pencil, Plus, ShieldCheck, ShieldBan, Lock, Unlock, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { removeRoleFromAllUsers } from '@/services/role.service';


const AdminUsers = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedRoleId, setSelectedRoleId] = useState<string>('');
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedUserName, setSelectedUserName] = useState<string>('');
    const [selectedGlobalRoleId, setSelectedGlobalRoleId] = useState<string>('');
    const [removingRole, setRemovingRole] = useState(false);

    const { toast } = useToast();


    const handleOpenDeleteDialog = (id: string, userName: string) => {
        setSelectedUserId(id);
        setSelectedUserName(userName);
        setOpenDeleteDialog(true);
    };

    // Form states for edit
    const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });
    // Form states for add new user
    const [addForm, setAddForm] = useState({ name: '', email: '', password: '' });

    // Filter states
    const [filterEnabled, setFilterEnabled] = useState<string>('all');
    const [filterLocked, setFilterLocked] = useState<string>('all');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);

    // Filtered users
    const filteredUsers = users.filter((user) => {
        // 🔍 Search by name
        if (
            searchQuery &&
            !user.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
            return false;
        }


        if (filterEnabled !== 'all') {
            const isEnabled = filterEnabled === 'enabled';
            if (user.enabled !== isEnabled) return false;
        }
        if (filterLocked !== 'all') {
            const isLocked = filterLocked === 'locked';
            if (user.locked !== isLocked) return false;
        }
        if (filterRole !== 'all') {
            if (!user.roles?.some((r) => r.id === filterRole)) return false;
        }
        return true;
    });

const handleRemoveRoleFromAllUsers = async () => {
  if (!selectedGlobalRoleId) return;

  setRemovingRole(true);
  try {
    await removeRoleFromAllUsers(selectedGlobalRoleId);

    // Atualiza estado local removendo a role de todos os users
    setUsers((prev) =>
      prev.map((u) => ({
        ...u,
        roles: u.roles?.filter((r) => r.id !== selectedGlobalRoleId) || [],
      }))
    );

    const removedRole = roles.find((r) => r.id === selectedGlobalRoleId);

    toast({
      title: 'Role removed',
      description: `Role "${removedRole?.name}" removed from all users.`,
    });

    setSelectedGlobalRoleId('');
  } catch (error) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to remove role from all users.',
    });
  } finally {
    setRemovingRole(false);
  }
};



    // Pagination calculations
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterEnabled, filterLocked, filterRole]);

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



    const handleToggleEnable = async (user: User) => {
        try {
            if (user.enabled) {
                // DESATIVAR
                await disableUser(user.id);
                setUsers(users.map((u) =>
                    u.id === user.id ? { ...u, enabled: false } : u
                ));
                toast({ title: 'User disabled successfully',  className:' bg-orange-400/10 text-green-500 border border-green-400/20 backdrop-blur-sm justify-center'});
            } else {
                // ATIVAR
                await enableUser(user.id);
                setUsers(users.map((u) =>
                    u.id === user.id ? { ...u, enabled: true } : u
                ));
                toast({ title: 'User enabled successfully', className:'bg-green-400/10 text-green-500 border border-green-400/20 backdrop-blur-sm justify-center'});
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: `Failed to ${user.enabled ? 'disable' : 'enable'} user.`,
            });
        }
    };



    const handleToggleLock = async (user: User) => {
        try {
            if (user.locked) {
                await unlockUser(user.id);
                setUsers(users.map((u) => (u.id === user.id ? { ...u, locked: false } : u)));
                toast({ title: 'User unlocked successfully',className:'text-green-300 justify-center' });
            } else {
                await lockUser(user.id);
                setUsers(users.map((u) => (u.id === user.id ? { ...u, locked: true } : u)));
                toast({ title: 'User locked successfully', className:'text-red-500 justify-center' });
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: `Failed to ${user.locked ? 'unlock' : 'lock'} user.`,
            });
        }
    };

    const handleOpenRoleDialog = (user: User) => {
        setSelectedUser(user);
        setSelectedRoleId('');
        setIsRoleDialogOpen(true);
    };

    const handleViewUser = async (user: User) => {
        try {
            const userData = await getUserById(user.id);
            setSelectedUser(userData);
            setIsViewDialogOpen(true);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load user details.',
            });
        }
    };

    const handleOpenEditDialog = (user: User) => {
        setSelectedUser(user);
        setEditForm({ name: user.name, email: user.email, password: '' });
        setIsEditDialogOpen(true);
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;

        setProcessing(true);
        try {
            const updateData: RegisterData = {
                name: editForm.name,
                email: editForm.email,
                password: editForm.password,
            };

            const updatedUser = await updateUser(selectedUser.id, updateData);
            setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, ...updatedUser } : u)));
            toast({ title: 'User updated successfully' });
            setIsEditDialogOpen(false);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update user.',
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleAddUser = async () => {
        if (!addForm.name || !addForm.email || !addForm.password) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please fill in all fields.',
            });
            return;
        }

        setProcessing(true);
        try {
            await register(addForm);
            // Refresh user list
            const updatedUsers = await getAllUsers();
            setUsers(updatedUsers);
            toast({
                title: 'User created successfully',
                className: 'bg-green-500 text-white',
            });
            setIsAddDialogOpen(false);
            setAddForm({ name: '', email: '', password: '' });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to create user.',
            });
        } finally {
            setProcessing(false);
        }
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

    const handleRemoveRole = async (id: string, roleId: string) => {
        try {
            await removeRoleFromUser(id, roleId);
            setUsers(
                users.map((u) =>
                    u.id === id
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


    const handleDeleteUser = async () => {
  if (!selectedUserId) return;

  try {
    await deleteUser(selectedUserId);

    setUsers(users.filter(u => u.id !== selectedUserId));

    toast({
      title: "User deleted successfully"
    });

  } catch {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to delete user"
    });
  }

  setOpenDeleteDialog(false);
    };
    
    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
                        <p className="text-muted-foreground">Manage users and their roles</p>
                    </div>
                    <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New User
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-48"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Filters:</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Label htmlFor="filter-enabled" className="text-sm text-muted-foreground">Enabled:</Label>
                        <Select value={filterEnabled} onValueChange={setFilterEnabled}>
                            <SelectTrigger id="filter-enabled" className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="enabled">Enabled</SelectItem>
                                <SelectItem value="disabled">Disabled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Label htmlFor="filter-locked" className="text-sm text-muted-foreground">Locked:</Label>
                        <Select value={filterLocked} onValueChange={setFilterLocked}>
                            <SelectTrigger id="filter-locked" className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="locked">Locked</SelectItem>
                                <SelectItem value="unlocked">Unlocked</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Label htmlFor="filter-role" className="text-sm text-muted-foreground">Role:</Label>
                        <Select value={filterRole} onValueChange={setFilterRole}>
                            <SelectTrigger id="filter-role" className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.id}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {(filterEnabled !== 'all' || filterLocked !== 'all' || filterRole !== 'all') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setFilterEnabled('all');
                                setFilterLocked('all');
                                setFilterRole('all');
                            }}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Clear filters
                        </Button>
                    )}

                <div className="flex flex-wrap items-end gap-4 p-4 rounded-lg border border-border bg-destructive/5">
                <div className="flex flex-col gap-2">
                    <Label className="text-sm text-muted-foreground">
                    Remove role from all users
                    </Label>

                    <Select
                    value={selectedGlobalRoleId}
                    onValueChange={setSelectedGlobalRoleId}
                    >
                    <SelectTrigger className="w-56">
                        <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                        {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                            {role.name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>

                <Button
                    variant="destructive"
                    disabled={!selectedGlobalRoleId || removingRole}
                    onClick={handleRemoveRoleFromAllUsers}
                >
                    {removingRole ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Removing...
                    </>
                    ) : (
                    <>
                        <ShieldBan className="mr-2 h-4 w-4" />
                        Remove from all users
                    </>
                    )}
                </Button>
                </div>

                </div>

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
                                    <TableHead>Status</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>


                                {paginatedUsers.map((user) => (

                                    <TableRow key={user.id} className="hover:bg-muted/30">
                                        <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 ">

                                                <Badge variant={user.enabled ? "default" : "outline"}>
                                                    {user.enabled ? 'Enabled' : 'Disabled'}
                                                </Badge>


                                                <Badge variant={user.locked ? "destructive" : "outline"}>
                                                    {user.locked ? 'Locked' : 'Unlocked'}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        
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
                                                {/* View User */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewUser(user)}
                                                    title="View User"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>

                                                {/* Edit User */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenEditDialog(user)}
                                                    title="Edit User"
                                                >
                                                    <span className="inline-flex items-center rounded-md bg-green-400/10 text-orange-400 inset-ring inset-ring-green-500/20">  <Pencil className="h-4 w-4" /></span>
                                                </Button>

                                                {/* Lock/Unlock User */}
                                                {user.id !== currentUser?.id && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleEnable(user)}
                                                        title={user.enabled ? "Enable User" : "Enable User"}>
                                                        {user.enabled ? (
                                                            <span
                                                                className="inline-flex items-center rounded-md bg-green-400/10 
                                                                text-green-400 inset-ring inset-ring-green-500/20">
                                                                <ShieldCheck className="h-4 w-4 " />
                                                            </span>

                                                        ) : (
                                                            <ShieldBan className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}


                                                {user.id !== currentUser?.id && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleLock(user)}
                                                        title={user.locked ? "Unlock User" : "Lock User"}
                                                    >
                                                        {user.locked ? (
                                                            <Lock className="h-4 w-4  text-red-600  " /> 
                                                        ) : (
                                                            <Unlock className="h-4 w-4  text-green-400" />
                                                        )}
                                                    </Button>
                                                )}




                                                {/* Add Role */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenRoleDialog(user)}
                                                    disabled={getAvailableRoles(user).length === 0}
                                                    title="Add Role"
                                                >
                                                    <UserPlus className="mr-1 h-4 w-4   text-green-400 " />
                                                    Add Role
                                                </Button>

                                                {/* Delete User */}
                                                {user.id !== currentUser?.id && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleOpenDeleteDialog(user.id, user.name)}
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="h-4 w-4  text-red-600" />
                                                    </Button>

                                                    
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                                }
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && filteredUsers.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-4 px-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                            </span>
                            <span className="mx-2">|</span>
                            <Label htmlFor="items-per-page" className="text-sm">Per page:</Label>
                            <Select value={itemsPerPage.toString()} onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
                                <SelectTrigger id="items-per-page" className="w-20 h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="30">30</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let pageNum: number;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setCurrentPage(pageNum)}
                                            className="w-8 h-8 p-0"
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}>
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
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

                {/* View User Dialog */}
                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>User Details</DialogTitle>
                            <DialogDescription>View user information</DialogDescription>
                        </DialogHeader>
                        {selectedUser && (
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-muted-foreground">Name</Label>
                                        <p className="text-foreground font-medium">{selectedUser.name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Email</Label>
                                        <p className="text-foreground font-medium">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">User ID</Label>
                                    <p className="text-foreground font-mono text-sm">{selectedUser.id}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Roles</Label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {selectedUser.roles?.length ? (
                                            selectedUser.roles.map((role) => (
                                                <Badge key={role.id} variant="secondary">
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    {role.name}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground">No roles assigned</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit User Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>Update user information</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    placeholder="Enter name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    placeholder="Enter email"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-password">Password (leave empty to keep current)</Label>
                                <Input
                                    id="edit-password"
                                    type="password"
                                    value={editForm.password}
                                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                    placeholder="Enter new password"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdateUser}
                                className="gradient-primary"
                                disabled={processing || !editForm.name || !editForm.email}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update User'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Add New User Dialog */}
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New User</DialogTitle>
                            <DialogDescription>Create a new user account</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="add-name">Name</Label>
                                <Input
                                    id="add-name"
                                    value={addForm.name}
                                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                                    placeholder="Enter name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="add-email">Email</Label>
                                <Input
                                    id="add-email"
                                    type="email"
                                    value={addForm.email}
                                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                                    placeholder="Enter email"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="add-password">Password</Label>
                                <Input
                                    id="add-password"
                                    type="password"
                                    value={addForm.password}
                                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                                    placeholder="Enter password"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddUser}
                                className="gradient-primary"
                                disabled={processing || !addForm.name || !addForm.email || !addForm.password}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create User'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete user</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete the user{' '}
                                <span className="font-semibold">{selectedUserName}</span>?
                                <br />
                                This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => setOpenDeleteDialog(false)}
                            >
                                Cancel
                            </Button>

                            

                            <Button
                                    variant="destructive"
                                    onClick={handleDeleteUser}
                                    >
                                    Confirm delete
                                    </Button>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </Layout>
    );
};

export default AdminUsers;
