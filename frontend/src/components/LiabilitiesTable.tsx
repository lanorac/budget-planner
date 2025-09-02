import React, { useState } from 'react';
import { useLiabilities, useCreateLiability, useUpdateLiability, useDeleteLiability } from '../hooks/useLiabilities';
import EnhancedTable from './shared/EnhancedTable';
import type { TableColumn, TableRow } from './shared/EnhancedTable';



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

export const LiabilitiesTable: React.FC<LiabilitiesTableProps> = ({ plannerId, scenario = 'ALL' }) => {
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

  // Define table columns
  const columns: TableColumn[] = [
    { key: 'name', label: 'Name', type: 'text', editable: true },
    { key: 'monthly_cost', label: 'Monthly Cost', type: 'currency', editable: true },
    { key: 'principal', label: 'Principal', type: 'currency', editable: true },
    { key: 'include_toggle', label: 'Include', type: 'checkbox' },
    { key: 'scenario', label: 'Scenario', type: 'scenario' },
    { key: 'notes', label: 'Notes', type: 'text', editable: true },
  ];

  const handleRowUpdate = async (id: string, field: string, value: any) => {
    try {
      await updateLiability.mutateAsync({ id, [field]: value });
    } catch (error) {
      console.error('Error updating liability:', error);
    }
  };

  const handleRowDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this liability?')) {
      try {
        await deleteLiability.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting liability:', error);
      }
    }
  };

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
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Liabilities</h3>
          <p className="text-gray-600">Loading your liabilities...</p>
        </div>
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className="table-header">
                      {column.label}
                    </th>
                  ))}
                  <th className="table-header w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((column) => (
                      <td key={column.key} className="table-cell">
                        <div className="h-4 bg-gray-300 rounded w-24"></div>
                      </td>
                    ))}
                    <td className="table-cell">
                      <div className="h-4 bg-gray-300 rounded w-16"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Error Loading Liabilities</h3>
          <p className="text-gray-500 mb-4">Unable to load financial data. Please check:</p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>Make sure the backend server is running on port 3000</li>
            <li>Check your internet connection</li>
            <li>Try refreshing the page</li>
          </ul>
        </div>
      </div>
    );
  }

  const liabilitiesList = liabilities || [];

  // Prepare data for enhanced table
  const tableData: TableRow[] = liabilitiesList.map(liability => ({
    id: liability.id,
    name: liability.name,
    monthly_cost: liability.monthly_cost,
    principal: liability.principal || 0,
    include_toggle: liability.include_toggle,
    scenario: liability.scenario,
    notes: liability.notes || ''
  }));

  // Prepare summary data
  const summaryData = [
    { label: 'Total Liabilities', value: liabilitiesList.length },
    { label: 'Total Monthly Cost', value: `€${liabilitiesList.reduce((sum, liability) => sum + (liability.monthly_cost || 0), 0).toLocaleString()}` },
    { label: 'Active Liabilities', value: liabilitiesList.filter(liability => liability.include_toggle === 'on').length, color: 'text-green-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Liabilities</h3>
          <p className="text-gray-600 mt-1">
            Manage your liabilities and monthly payments across different scenarios.
          </p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg">
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

      {/* Enhanced Table */}
      <EnhancedTable
        columns={columns}
        data={tableData}
        onRowUpdate={handleRowUpdate}
        onRowDelete={handleRowDelete}
        onRowAdd={() => setIsAdding(true)}
        addButtonText="Add Liability"
        emptyMessage="No liabilities found. Add your first liability to get started!"
        summaryData={summaryData}
      />
    </div>
  );
};
