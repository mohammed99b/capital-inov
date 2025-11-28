import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAchats, createAchat, updateAchat } from '../api/achats';
import { getChantiers } from '../api/chantiers';
import { Plus, Pencil, Filter } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Achat } from '../types';
import { parseApiErrors, ApiErrors } from '../utils/apiErrors';

export default function Achats() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<ApiErrors>({ global: null, fields: {} });
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState('all');
  const [chantierFilter, setChantierFilter] = useState('all');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  const [formData, setFormData] = useState<Partial<Achat>>({
    chantier: '',
    supplier: '',
    reference: '',
    amount: 0,
    date: '',
    status: 'brouillon'
  });

  const { data: achats, isLoading } = useQuery({
    queryKey: ['achats'],
    queryFn: () => getAchats(),
  });

  const { data: chantiers } = useQuery({
    queryKey: ['chantiers'],
    queryFn: () => getChantiers(),
  });

  const resetForm = () => {
    setFormData({ chantier: '', supplier: '', reference: '', amount: 0, date: '', status: 'brouillon' });
    setEditingId(null);
    setErrors({ global: null, fields: {} });
  };

  const createMutation = useMutation({
    mutationFn: createAchat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achats'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      setErrors(parseApiErrors(err));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Achat> }) => updateAchat(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achats'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      setErrors(parseApiErrors(err));
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

  const handleEdit = (achat: Achat) => {
    setEditingId(achat.id);
    setFormData({
        chantier: achat.chantier,
        supplier: achat.supplier,
        reference: achat.reference,
        amount: Number(achat.amount),
        date: achat.date,
        status: achat.status
    });
    setErrors({ global: null, fields: {} });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Filtering Logic
  const filteredAchats = achats?.filter(achat => {
    const matchesStatus = statusFilter === 'all' || achat.status === statusFilter;
    const matchesChantier = chantierFilter === 'all' || achat.chantier === chantierFilter;
    
    let matchesDate = true;
    if (dateStart) {
        matchesDate = matchesDate && new Date(achat.date) >= new Date(dateStart);
    }
    if (dateEnd) {
        matchesDate = matchesDate && new Date(achat.date) <= new Date(dateEnd);
    }
    
    return matchesStatus && matchesChantier && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
        case 'valide': return <Badge variant="success">Validé</Badge>;
        case 'paye': return <Badge variant="success">Payé</Badge>;
        case 'brouillon': return <Badge variant="gray">Brouillon</Badge>;
        default: return <Badge>{status}</Badge>;
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Achats</h1>
          <p className="mt-2 text-sm text-gray-700">Suivi des dépenses et factures fournisseurs.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel Achat
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center mb-3">
            <Filter className="h-4 w-4 text-gray-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">Filtres</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Statut</label>
                <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">Tous</option>
                    <option value="brouillon">Brouillon</option>
                    <option value="valide">Validé</option>
                    <option value="paye">Payé</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Chantier</label>
                <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    value={chantierFilter}
                    onChange={(e) => setChantierFilter(e.target.value)}
                >
                    <option value="all">Tous</option>
                    {chantiers?.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date début</label>
                <input
                    type="date"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date fin</label>
                <input
                    type="date"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                />
            </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg bg-white">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Chantier</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fournisseur</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Réf</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Montant</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isLoading ? (
                    <tr><td colSpan={7} className="p-4 text-center">Chargement...</td></tr>
                  ) : filteredAchats?.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-gray-500">Aucun achat ne correspond aux critères.</td></tr>
                  ) : (
                    filteredAchats?.map((achat) => (
                    <tr key={achat.id} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">{achat.chantier_name || 'N/A'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{achat.supplier}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{achat.reference}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{Number(achat.amount).toLocaleString()} €</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{achat.date}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        {getStatusBadge(achat.status)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                        <button 
                            onClick={() => handleEdit(achat)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition-colors"
                            title="Modifier"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
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
        title={editingId ? "Modifier l'achat" : "Ajouter un achat"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chantier</label>
            <select 
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                value={formData.chantier} 
                onChange={e => setFormData({...formData, chantier: e.target.value})}
                required
            >
                <option value="">Sélectionner un chantier</option>
                {chantiers?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
            {errors.fields.chantier && <p className="mt-1 text-sm text-red-600">{errors.fields.chantier}</p>}
          </div>
          <Input 
            label="Fournisseur"
            value={formData.supplier} 
            onChange={e => setFormData({...formData, supplier: e.target.value})} 
            required 
            error={errors.fields.supplier}
          />
          <Input 
            label="Référence facture"
            value={formData.reference} 
            onChange={e => setFormData({...formData, reference: e.target.value})} 
            required 
            error={errors.fields.reference}
          />
          <Input 
            label="Montant (€)"
            type="number"
            value={formData.amount} 
            onChange={e => setFormData({...formData, amount: Number(e.target.value)})} 
            required 
            error={errors.fields.amount}
          />
          <Input 
            label="Date"
            type="date"
            value={formData.date} 
            onChange={e => setFormData({...formData, date: e.target.value})} 
            required 
            error={errors.fields.date}
          />
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
             <select 
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="brouillon">Brouillon</option>
                <option value="valide">Validé</option>
                <option value="paye">Payé</option>
              </select>
              {errors.fields.status && <p className="mt-1 text-sm text-red-600">{errors.fields.status}</p>}
          </div>

          {errors.global && (
             <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                 {errors.global}
             </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" isLoading={isSubmitting}>
                {editingId ? 'Modifier' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}