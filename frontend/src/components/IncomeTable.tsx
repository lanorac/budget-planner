import React, { useState } from 'react';
import { useIncome, useCreateIncome, useUpdateIncome, useDeleteIncome } from '../hooks/useIncome';
import EnhancedTable from './shared/EnhancedTable';
import type { TableColumn, TableRow } from './shared/EnhancedTable';



interface IncomeCreate {
  planner_id: string;
  name: string;
  include_toggle: 'on' | 'off';
  scenario: 'ALL' | 'A' | 'B' | 'C';
  monthly_amount: number;
  notes?: string;
}

interface IncomeTableProps {
  plannerId: string;
  scenario?: string;
  onNavigateToTab?: (tabIndex: number) => void;
}

export const IncomeTable: React.FC<IncomeTableProps> = ({ plannerId, scenario = 'ALL' }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<IncomeCreate>>({
    name: '',
    include_toggle: 'on',
    scenario: 'ALL',
    monthly_amount: 0,
    notes: ''
  });

  const { data: incomeEntries, isLoading, error } = useIncome(plannerId, scenario);
  const createIncome = useCreateIncome();
  const updateIncome = useUpdateIncome();
  const deleteIncome = useDeleteIncome();

  // Define table columns
  const columns: TableColumn[] = [
    { key: 'name', label: 'Name', type: 'text', editable: true },
    { key: 'monthly_amount', label: 'Monthly Amount', type: 'currency', editable: true },
    { key: 'include_toggle', label: 'Include', type: 'checkbox' },
    { key: 'scenario', label: 'Scenario', type: 'scenario' },
    { key: 'notes', label: 'Notes', type: 'text', editable: true },
  ];

  const handleRowUpdate = async (id: string, field: string, value: any) => {
    try {
      await updateIncome.mutateAsync({ id, [field]: value });
    } catch (error) {
      console.error('Error updating income:', error);
    }
  };

  const handleRowDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this income entry?')) {
      try {
        await deleteIncome.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting income:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.monthly_amount) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        await updateIncome.mutateAsync({ id: editingId, ...formData });
        setEditingId(null);
      } else {
        await createIncome.mutateAsync({
          ...formData as IncomeCreate,
          planner_id: plannerId
        });
        setIsAdding(false);
      }
      setFormData({
        name: '',
        include_toggle: 'on',
        scenario: 'ALL',
        monthly_amount: 0,
        notes: ''
      });
    } catch (error) {
      console.error('Error saving income:', error);
      alert('Failed to save income');
    }
  };



  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      name: '',
      include_toggle: 'on',
      scenario: 'ALL',
      monthly_amount: 0,
      notes: ''
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Income</h3>
          <p className="text-gray-600">Loading your income data...</p>
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
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Error Loading Income</h3>
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

  const incomeList = incomeEntries || [];

  // Prepare data for enhanced table
  const tableData: TableRow[] = incomeList.map(income => ({
    id: income.id,
    name: income.name,
    monthly_amount: income.monthly_amount,
    include_toggle: income.include_toggle,
    scenario: income.scenario,
    notes: income.notes || ''
  }));

  // Prepare summary data
  const summaryData = [
    { label: 'Total Income Sources', value: incomeList.length },
    { label: 'Total Monthly Income', value: `€${incomeList.reduce((sum, income) => sum + (income.monthly_amount || 0), 0).toLocaleString()}` },
    { label: 'Active Income', value: incomeList.filter(income => income.include_toggle === 'on').length, color: 'text-green-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Income</h3>
          <p className="text-gray-600 mt-1">
            Manage your income sources and monthly amounts across different scenarios.
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Amount *</label>
              <input
                type="number"
                step="0.01"
                value={formData.monthly_amount || ''}
                onChange={(e) => setFormData({ ...formData, monthly_amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Include</label>
              <select
                value={formData.include_toggle || 'on'}
                onChange={(e) => setFormData({ ...formData, include_toggle: e.target.value as 'on' | 'off' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              disabled={createIncome.isPending || updateIncome.isPending}
            >
              {createIncome.isPending || updateIncome.isPending ? 'Saving...' : (editingId ? 'Update' : 'Add')}
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
        addButtonText="Add Income"
        emptyMessage="No income entries found. Add your first income source to get started!"
        summaryData={summaryData}
      />
    </div>
  );
};
