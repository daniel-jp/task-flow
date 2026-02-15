import { useEffect, useState } from 'react';
import {
  getAllRoles,
  createRole,
  deleteRole,
} from '@/services/role.service';
import { Role } from '@/services/auth.service';
import { Trash2, Users, Plus } from 'lucide-react';
import Layout from '@/components/Layout';
import { Eye, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { updateRole } from '@/services/role.service';
import { Button } from 'react-day-picker';


const Roles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [newRole, setNewRole] = useState('');
  const [loading, setLoading] = useState(false);
const [selectedRole, setSelectedRole] = useState<Role | null>(null);
const [editName, setEditName] = useState('');
const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  
  const [deleteOpen, setDeleteOpen] = useState(false);
const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);


  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await getAllRoles();
      setRoles(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreateRole = async () => {
    if (!newRole.trim()) return;
    await createRole(newRole);
    setNewRole('');
    fetchRoles();
  };

  const handleAskDeleteRole = (role: Role) => {
  setRoleToDelete(role);
  setDeleteOpen(true);
};

const handleConfirmDeleteRole = async () => {
  if (!roleToDelete) return;

  try {
    await deleteRole(roleToDelete.id);
    toast({
      title: 'Role removido 🗑️',
      description: `O role "${roleToDelete.name}" foi removido com sucesso.`,
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


  const handleViewRole = (role: Role) => {
  setSelectedRole(role);
  setViewOpen(true);
  };
  
  const handleEditRole = (role: Role) => {
  setSelectedRole(role);
  setEditName(role.name);
  setEditOpen(true);
};

  const handleUpdateRole = async () => {
  if (!selectedRole || !editName.trim()) return;

  try {
    await updateRole(selectedRole.id, editName);
    toast({
      title: 'Role atualizado ✅',
      description: 'Nome do role atualizado com sucesso.',
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

      {/* Create Role */}
      <div className="flex gap-2 max-w-md">
        <input
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          placeholder="Nome do role"
          className="flex-1 rounded-lg border px-3 py-2 bg-background"
        />
        <button
          onClick={handleCreateRole}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Criar
        </button>
      </div>

      {/* Roles Table */}
      <div className="rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b">
              <tr>
        <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-b last:border-none">
                <td className="px-4 py-3 font-medium text-muted-foreground">{role.id}</td>
                <td className="px-4 py-3 font-medium text-muted-foreground">{role.name}</td>

                <td className="px-4 py-3 flex justify-center gap-2">
                    {/* View */}
                    <button
                      onClick={() => handleViewRole(role)}
                      className="rounded-lg p-2 hover:bg-muted"
                      title="Visualizar role"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => handleEditRole(role)}
                      className="rounded-lg p-2 hover:bg-muted"
                      title="Editar role"
                    >
                      <Pencil className="h-4 w-4 text-orange-400" />
                    </button>


                  {/* Delete */}
                  <button
                      onClick={() => handleAskDeleteRole(role)}
                      className="rounded-lg p-2 hover:bg-destructive/10 text-destructive"
                      title="Excluir role">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>

                  </td>


              </tr>
            ))}
          </tbody>
        </table>

        {!loading && roles.length === 0 && (
          <div className="p-6 text-center text-muted-foreground">
            Nenhum role encontrado
          </div>
        )}
      </div>
      </div>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Role</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 text-sm h-auto">
            <p className='p-4'><strong>ID:</strong> {selectedRole?.id}</p>
            <p className='p-4'><strong >Nome:</strong> {selectedRole?.name}</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Editar Role</DialogTitle>
    </DialogHeader>

    <input
      value={editName}
      onChange={(e) => setEditName(e.target.value)}
      className="w-full rounded-lg border px-3 py-2 bg-background"
      placeholder="Nome do role"
    />

        <DialogFooter>
          <button
            onClick={() => setEditOpen(false)}
            className="rounded-lg px-4 py-2 border"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpdateRole}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Salvar
          </button>
        </DialogFooter>
      </DialogContent>
      </Dialog>
      
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja remover o role{' '}
            <strong>{roleToDelete?.name}</strong> ?   
            Esta ação não pode ser desfeita.
          </p>

          <DialogFooter className="gap-2">
            <button
              onClick={() => setDeleteOpen(false)}
              className="rounded-lg border px-4 py-2"
            >
              Cancelar
            </button>

            <button
              onClick={handleConfirmDeleteRole}
              className="rounded-lg bg-destructive px-4 py-2 text-destructive-foreground hover:opacity-90"
            >
              Excluir
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



  </Layout>
  );
};

export default Roles;
