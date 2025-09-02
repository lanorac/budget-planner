import React, { useState } from 'react'
import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset } from '../hooks/useAssets'
import EnhancedTable from './shared/EnhancedTable'
import type { TableColumn, TableRow } from './shared/EnhancedTable'



interface AssetCreate {
  planner_id: string;
  name: string;
  include_toggle: 'on' | 'off';
  scenario: 'ALL' | 'A' | 'B' | 'C';
  sale_value: number;
  notes?: string;
}

interface AssetsTableProps {
  plannerId: string;
  scenario?: string;
  onNavigateToTab?: (tabIndex: number) => void;
}

export default function AssetsTable({ plannerId, scenario = 'ALL' }: AssetsTableProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AssetCreate>>({
    name: '', include_toggle: 'on', scenario: 'ALL', sale_value: 0, notes: ''
  });

  const { data: assets, isLoading, error } = useAssets(plannerId, scenario);
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();

  // Define table columns
  const columns: TableColumn[] = [
    { key: 'icon', label: '', type: 'icon', width: '60px' },
    { key: 'name', label: 'Name', type: 'text', editable: true },
    { key: 'include_toggle', label: 'Include', type: 'checkbox' },
    { key: 'scenario', label: 'Scenario', type: 'scenario' },
    { key: 'sale_value', label: 'Sale Value', type: 'currency', editable: true },
    { key: 'notes', label: 'Notes', type: 'text', editable: true },
  ];

  const handleRowUpdate = async (id: string, field: string, value: any) => {
    try {
      await updateAsset.mutateAsync({ id, [field]: value });
    } catch (error) {
      console.error('Error updating asset:', error);
    }
  };

  const handleRowDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await deleteAsset.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting asset:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.sale_value === undefined) return;

    try {
      if (editingId) {
        await updateAsset.mutateAsync({ id: editingId, ...formData });
        setEditingId(null);
      } else {
        await createAsset.mutateAsync({ ...formData, planner_id: plannerId } as AssetCreate);
        setIsAdding(false);
      }
      setFormData({ name: '', include_toggle: 'on', scenario: 'ALL', sale_value: 0, notes: '' });
    } catch (error) {
      console.error('Error saving asset:', error);
    }
  };



  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', include_toggle: 'on', scenario: 'ALL', sale_value: 0, notes: '' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Assets</h3>
          <p className="text-gray-600">Loading your assets...</p>
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
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Error Loading Assets</h3>
          <p className="text-gray-500 mb-4">Unable to load assets data. Please check:</p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>Make sure the backend server is running on port 3000</li>
            <li>Check your internet connection</li>
            <li>Try refreshing the page</li>
          </ul>
        </div>
      </div>
    )
  }

  const assetsList = assets || []
  
  // Debug info
  console.log('Assets data:', assets)
  console.log('Assets list length:', assetsList.length)
  console.log('Planner ID being used:', plannerId)

  // Prepare data for enhanced table
  const tableData: TableRow[] = assetsList.map(asset => ({
    id: asset.id,
    icon: '🏠',
    name: asset.name,
    include_toggle: asset.include_toggle,
    scenario: asset.scenario,
    sale_value: asset.sale_value,
    notes: asset.notes || ''
  }));
  
  console.log('Table data:', tableData)

  // Prepare summary data
  const totalValue = assetsList.length > 0 
    ? assetsList.reduce((sum, asset) => sum + (asset.sale_value || 0), 0)
    : 0;
    
  const summaryData = [
    { label: 'Total Assets', value: assetsList.length },
    { label: 'Total Value', value: `€${totalValue.toLocaleString()}` },
    { label: 'Active Sales', value: assetsList.filter(asset => asset.include_toggle === 'on').length, color: 'text-green-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Assets</h3>
          <p className="text-gray-600 mt-1">
            Manage your assets and their sale values across different scenarios.
          </p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Value</label>
              <input
                type="number"
                step="0.01"
                value={formData.sale_value || ''}
                onChange={(e) => setFormData({ ...formData, sale_value: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              disabled={createAsset.isPending || updateAsset.isPending}
            >
              {createAsset.isPending || updateAsset.isPending ? 'Saving...' : (editingId ? 'Update' : 'Add')}
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
        addButtonText="Add Asset"
        emptyMessage="No assets found. Add your first asset to get started."
        summaryData={summaryData}
      />
    </div>
  )
}
