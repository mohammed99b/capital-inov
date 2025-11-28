import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChantiers, createChantier, updateChantier, deleteChantier } from '../api/chantiers';
import { Plus, Search, Filter, Trash2, AlertTriangle, Pencil } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Chantier } from '../types';
import { parseApiErrors, ApiErrors } from '../utils/apiErrors';
import { useToastStore } from '../store/toastStore';

export default function Chantiers() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chantierToDelete, setChantierToDelete] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [errors, setErrors] = useState<ApiErrors>({ global: null, fields: {} });

  // Form State
  const initialFormState: Partial<Chantier> = {
    name: '',
    client: '',
    address: '',
    budget: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    status: 'en_cours'
  };

  const [formData, setFormData] = useState<Partial<Chantier>>(initialFormState);

  const { data: chantiers, isLoading } = useQuery({
    queryKey: ['chantiers'],
    queryFn: () => getChantiers(),
  });

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setErrors({ global: null, fields: {} });
  };

  const createMutation = useMutation({
    mutationFn: createChantier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chantiers'] });
      addToast("Chantier créé avec succès", "success");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      setErrors(parseApiErrors(err));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Chantier> }) => updateChantier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chantiers'] });
      addToast("Chantier mis à jour avec succès", "success");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      setErrors(parseApiErrors(err));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteChantier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chantiers'] });
      addToast("Chantier supprimé", "success");
      setIsDeleteModalOpen(false);
      setChantierToDelete(null);
    },
    onError: (err) => {
      addToast("Erreur lors de la suppression", "error");
      console.error(err);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ global: null, fields: {} });
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (chantier: Chantier) => {
    setEditingId(chantier.id);
    setFormData({
      name: chantier.name,
      client: chantier.client,
      address: chantier.address || '',
      budget: Number(chantier.budget),
      start_date: chantier.start_date,
      end_date: chantier.end_date || '',
      status: chantier.status
    });
    setErrors({ global: null, fields: {} });
    setIsModalOpen(true);
  };

  const confirmDelete = (id: string) => {
    setChantierToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (chantierToDelete) {
      deleteMutation.mutate(chantierToDelete);
    }
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const filteredChantiers = chantiers?.filter(c => {
    const term = search.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(term) || 
                          c.client.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
        case 'en_cours': return <Badge variant="success">En cours</Badge>;
        case 'termine': return <Badge variant="gray">Terminé</Badge>;
        case 'en_pause': return <Badge variant="warning">En pause</Badge>;
        default: return <Badge>{status}</Badge>;
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chantiers</h1>
          <p className="mt-2 text-sm text-gray-700">Gérez vos projets de construction et leur avancement.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={openModal}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Chantier
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                placeholder="Rechercher par nom ou client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        <div className="sm:w-64">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                    className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">Tous les statuts</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                    <option value="en_pause">En pause</option>
                </select>
            </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg bg-white">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nom</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Client</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Adresse</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Budget</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Début</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fin</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isLoading ? (
                    <tr><td colSpan={8} className="p-4 text-center text-gray-500">Chargement...</td></tr>
                  ) : filteredChantiers?.length === 0 ? (
                    <tr><td colSpan={8} className="p-8 text-center text-gray-500">Aucun chantier ne correspond à vos critères.</td></tr>
                  ) : (
                    filteredChantiers?.map((chantier) => (
                    <tr key={chantier.id} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">{chantier.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{chantier.client}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 truncate max-w-xs" title={chantier.address}>{chantier.address || '-'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{Number(chantier.budget).toLocaleString()} €</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{chantier.start_date}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{chantier.end_date || '-'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        {getStatusBadge(chantier.status)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleEdit(chantier)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition-colors"
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => confirmDelete(chantier.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? "Modifier le chantier" : "Créer un chantier"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Nom du chantier"
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            required 
            error={errors.fields.name}
          />
          <Input 
            label="Client"
            value={formData.client} 
            onChange={e => setFormData({...formData, client: e.target.value})} 
            required 
            error={errors.fields.client}
          />
          <Input 
            label="Adresse"
            value={formData.address} 
            onChange={e => setFormData({...formData, address: e.target.value})} 
            error={errors.fields.address}
          />
          <Input 
            label="Budget (€)"
            type="number"
            value={formData.budget} 
            onChange={e => setFormData({...formData, budget: Number(e.target.value)})} 
            required 
            error={errors.fields.budget}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
                label="Date de début"
                type="date"
                value={formData.start_date} 
                onChange={e => setFormData({...formData, start_date: e.target.value})} 
                required 
                error={errors.fields.start_date}
            />
            <Input 
                label="Date de fin (est.)"
                type="date"
                value={formData.end_date} 
                onChange={e => setFormData({...formData, end_date: e.target.value})} 
                error={errors.fields.end_date}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select 
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value as any})}
            >
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
                <option value="en_pause">En pause</option>
            </select>
          </div>

          {errors.global && (
             <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                 {errors.global}
             </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingId ? "Modifier" : "Créer"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Supprimer le chantier">
        <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Êtes-vous sûr ?
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-500">
                        Cette action est irréversible. Toutes les données associées à ce chantier (achats, etc.) seront potentiellement perdues ou désactivées.
                    </p>
                </div>
            </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <Button 
                variant="danger" 
                onClick={handleDelete}
                isLoading={deleteMutation.isPending}
                className="w-full sm:w-auto sm:ml-3"
            >
                Supprimer
            </Button>
            <Button 
                variant="secondary" 
                onClick={() => setIsDeleteModalOpen(false)}
                className="mt-3 w-full sm:mt-0 sm:w-auto"
            >
                Annuler
            </Button>
        </div>
      </Modal>
    </div>
  );
}