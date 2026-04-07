import { useEffect, useState } from 'react';
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
} from '@/services/role.service';
import { Role } from '@/services/auth.service';
import { Trash2, Plus, X, Eye, Pencil } from 'lucide-react';
import Layout from '@/components/Layout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Roles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [newRole, setNewRole] = useState('');
  const [searchName, setSearchName] = useState('');
  const [loading, setLoading] = useState(false);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editName, setEditName] = useState('');
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  // ================= FETCH =================
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await getAllRoles();
      setRoles(data);
      setAllRoles(data);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao carregar roles.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // ================= AUTO SEARCH =================
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!searchName.trim()) {
        setRoles(allRoles);
        return;
      }

      const filtered = allRoles.filter((role) =>
        role.name.toLowerCase().includes(searchName.toLowerCase())
      );

      setRoles(filtered);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchName, allRoles]);

  // ================= CREATE =================
  const handleCreateRole = async () => {
    if (!newRole.trim()) return;

    try {
      await createRole({ name: newRole.trim().toUpperCase() });
      toast({
        title: 'Role criado ✅',
        description: 'Novo role criado com sucesso.',
      });
      setNewRole('');
      fetchRoles();
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao criar role.',
      });
    }
  };

  // ================= DELETE =================
  const handleConfirmDeleteRole = async () => {
    if (!roleToDelete) return;

    try {
      await deleteRole(roleToDelete.id);
      toast({
        title: 'Role removido 🗑️',
        description: `O role "${roleToDelete.name}" foi removido.`,
      });
      fetchRoles();
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao remover role.',
      });
    } finally {
      setDeleteOpen(false);
      setRoleToDelete(null);
    }
  };

  // ================= UPDATE =================
  const handleUpdateRole = async () => {
    if (!selectedRole || !editName.trim()) return;

    try {
      await updateRole(selectedRole.id, editName.trim().toUpperCase());
      toast({
        title: 'Role atualizado ✅',
        description: 'Nome atualizado com sucesso.',
      });
      fetchRoles();
      setEditOpen(false);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao atualizar role.',
      });
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Gestão de Roles</h1>

        {/* ================= ACTION BOX ================= */}
        <div className="rounded-xl border bg-card p-6 space-y-6">

          <div className="flex flex-wrap gap-6 items-end">

            {/* CREATE */}
            <div className="flex flex-col sm:flex-row gap-2 flex-1 min-w-[250px]">
              <input
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="Novo role"
                className="flex-1 rounded-lg border px-3 py-2 bg-background"
              />
              <Button onClick={handleCreateRole}>
                <Plus className="h-4 w-4 mr-2" />
                Criar
              </Button>
            </div>

            {/* AUTO SEARCH */}
            <div className="flex flex-col sm:flex-row gap-2 flex-1 min-w-[250px]">
              <input
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Digite para buscar..."
                className="flex-1 rounded-lg border px-3 py-2 bg-background"
              />
              <Button
                variant="outline"
                onClick={() => setSearchName('')}
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>

          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="rounded-xl border bg-card">
          <Table className="w-full text-sm">
             <TableHeader>
           
               <TableRow className="bg-muted/50">
                  <TableHead>ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {roles.map((role) => (

                <TableRow  className="hover:bg-muted/30">
                  <TableCell className="font-medium text-foreground">{role.id}</TableCell>
                  <TableCell className="font-medium text-foreground">{role.name}</TableCell>
                  <TableCell  className="text-right">
                   <div className="flex items-center justify-end gap-2">
                     <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRole(role);
                        setViewOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRole(role);
                        setEditName(role.name);
                        setEditOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4 text-orange-400" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRoleToDelete(role);
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                  
                </TableRow>
              ))}
              </TableBody>
          </Table>

          {!loading && roles.length === 0 && (
            <div className="p-6 text-center text-muted-foreground">
              Nenhum role encontrado
            </div>
          )}
        </div>
      </div>

      {/* ================= VIEW DIALOG ================= */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="w-full max-w-md sm:max-w-lg lg:max-w-xl p-4 sm:p-6">
          
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Detalhes do Role
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-sm sm:text-base break-words">
            
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold mr-2">ID:</span>
              <span className="text-muted-foreground break-all">
                {selectedRole?.id}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold mr-2">Nome:</span>
              <span className="text-muted-foreground">
                {selectedRole?.name}
              </span>
            </div>

          </div>

        </DialogContent>
      </Dialog>

      {/* ================= EDIT DIALOG ================= */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="w-full max-w-md sm:max-w-lg lg:max-w-xl p-4 sm:p-6">
            
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Editar Role
              </DialogTitle>
            </DialogHeader>

            {/* INPUT */}
            <div className="mt-4">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nome do role..."
                className="w-full rounded-lg border px-3 py-2 bg-background text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* BOTÕES */}
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-4">
              
              <Button 
                onClick={() => setEditOpen(false)} 
                variant="outline"
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>

              <Button 
                onClick={handleUpdateRole}
                className="w-full sm:w-auto"
              >
                Salvar
              </Button>

            </DialogFooter>

          </DialogContent>
        </Dialog>

      {/* ================= DELETE DIALOG ================= */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja remover o role{' '}
            <strong>{roleToDelete?.name}</strong>?
          </p>

          <DialogFooter>
            <Button onClick={() => setDeleteOpen(false)} variant="outline">
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDeleteRole}
              className="bg-destructive text-destructive-foreground"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Layout>
  );
};

export default Roles;