import React, { useState } from 'react';
import { useLiabilities, useCreateLiability, useUpdateLiability, useDeleteLiability } from '../hooks/useLiabilities';

// Define types locally to avoid import issues
interface Liability {
  id: string;
  planner_id: string;
  name: string;
  include_toggle: 'on' | 'off';
  scenario: 'ALL' | 'A' | 'B' | 'C';
  monthly_cost: number;
  principal?: number;
  linked_asset_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface LiabilityCreate {
  planner_id: string;
  name: string;
  include_toggle: 'on' | 'off';
  scenario: 'ALL' | 'A' | 'B' | 'C';
  monthly_cost: number;
  principal?: number;
  linked_asset_id?: string;
  notes?: string;
}

interface LiabilitiesTableProps {
  plannerId: string;
  scenario?: string;
  onNavigateToTab?: (tabIndex: number) => void;
}

export const LiabilitiesTable: React.FC<LiabilitiesTableProps> = ({ plannerId, scenario = 'ALL', onNavigateToTab }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<LiabilityCreate>>({
    name: '',
    include_toggle: 'on',
    scenario: 'ALL',
    monthly_cost: 0,
    principal: 0,
    notes: ''
  });

  const { data: liabilities, isLoading, error } = useLiabilities(plannerId, scenario);
  const createLiability = useCreateLiability();
  const updateLiability = useUpdateLiability();
  const deleteLiability = useDeleteLiability();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.monthly_cost) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        await updateLiability.mutateAsync({ id: editingId, ...formData });
        setEditingId(null);
      } else {
        await createLiability.mutateAsync({
          ...formData as LiabilityCreate,
          planner_id: plannerId
        });
        setIsAdding(false);
      }
      setFormData({
        name: '',
        include_toggle: 'on',
        scenario: 'ALL',
        monthly_cost: 0,
        principal: 0,
        notes: ''
      });
    } catch (error) {
      console.error('Error saving liability:', error);
      alert('Failed to save liability');
    }
  };

  const handleEdit = (liability: Liability) => {
    setEditingId(liability.id);
    setFormData({
      name: liability.name,
      include_toggle: liability.include_toggle,
      scenario: liability.scenario,
      monthly_cost: liability.monthly_cost,
      principal: liability.principal || 0,
      notes: liability.notes || ''
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this liability?')) {
      try {
        await deleteLiability.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting liability:', error);
        alert('Failed to delete liability');
      }
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      name: '',
      include_toggle: 'on',
      scenario: 'ALL',
      monthly_cost: 0,
      principal: 0,
      notes: ''
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Error Loading Liabilities</p>
          <p className="text-sm text-gray-600 mb-4">
            Unable to load financial data. Please check:
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• Make sure the backend server is running on port 3000</li>
            <li>• Check your internet connection</li>
            <li>• Try refreshing the page</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Liabilities</h2>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add Liability
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Cost *</label>
              <input
                type="number"
                step="0.01"
                value={formData.monthly_cost || ''}
                onChange={(e) => setFormData({ ...formData, monthly_cost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Principal</label>
              <input
                type="number"
                step="0.01"
                value={formData.principal || ''}
                onChange={(e) => setFormData({ ...formData, principal: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Include</label>
              <select
                value={formData.include_toggle || 'on'}
                onChange={(e) => setFormData({ ...formData, include_toggle: e.target.value as 'on' | 'off' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="on">On</option>
                <option value="off">Off</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scenario</label>
              <select
                value={formData.scenario || 'ALL'}
                onChange={(e) => setFormData({ ...formData, scenario: e.target.value as 'ALL' | 'A' | 'B' | 'C' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Scenarios</option>
                <option value="A">Scenario A</option>
                <option value="B">Scenario B</option>
                <option value="C">Scenario C</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              disabled={createLiability.isPending || updateLiability.isPending}
            >
              {createLiability.isPending || updateLiability.isPending ? 'Saving...' : (editingId ? 'Update' : 'Add')}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Liabilities Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Include</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scenario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {liabilities?.map((liability) => (
              <tr key={liability.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {liability.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${liability.monthly_cost.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {liability.principal ? `$${liability.principal.toLocaleString()}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    liability.include_toggle === 'on' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {liability.include_toggle === 'on' ? '✅ On' : '❌ Off'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {liability.scenario}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {liability.notes || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(liability)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(liability.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      disabled={deleteLiability.isPending}
                    >
                      {deleteLiability.isPending ? '🗑️ Deleting...' : '🗑️ Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {(!liabilities || liabilities.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <p>No liabilities found. Add your first liability to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};
