import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChantiers } from '../api/chantiers';
import { getAchats } from '../api/achats';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Euro, Building2, ShoppingBag } from 'lucide-react';
import { Card } from '../components/ui/Card';

export default function Dashboard() {
  const { data: chantiers, isLoading: loadingChantiers } = useQuery({
    queryKey: ['chantiers'],
    queryFn: () => getChantiers(),
  });

  const { data: achats, isLoading: loadingAchats } = useQuery({
    queryKey: ['achats'],
    queryFn: () => getAchats(),
  });

  if (loadingChantiers || loadingAchats) {
    return <div className="flex justify-center p-12">Chargement...</div>;
  }

  const activeChantiers = chantiers?.filter(c => c.status === 'en_cours') || [];
  const totalBudget = activeChantiers.reduce((acc, curr) => acc + Number(curr.budget), 0);
  const totalAchats = achats?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

  const chartData = chantiers?.map(c => ({
    name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
    budget: Number(c.budget)
  })).slice(0, 8) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        Tableau de bord
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card 
          title="Chantiers en cours" 
          value={activeChantiers.length} 
          icon={Building2} 
        />
        <Card 
          title="Budget engagé (actifs)" 
          value={`${totalBudget.toLocaleString()} €`} 
          icon={Euro} 
        />
        <Card 
          title="Total Achats" 
          value={`${totalAchats.toLocaleString()} €`} 
          icon={ShoppingBag}
          subtext="Cumul global"
        />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Aperçu Budgets Chantiers</h3>
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="budget" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
