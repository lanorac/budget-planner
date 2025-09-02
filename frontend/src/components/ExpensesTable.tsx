import React, { useState } from 'react';
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from '../hooks/useExpenses';
import EnhancedTable from './shared/EnhancedTable';
import type { TableColumn, TableRow } from './shared/EnhancedTable';



interface ExpenseCreate {
  planner_id: string;
  name: string;
  include_toggle: 'on' | 'off';
  scenario: 'ALL' | 'A' | 'B' | 'C';
  monthly_amount: number;
  category_id?: string;
  linked_asset_id?: string;
  linked_liab_id?: string;
  notes?: string;
}

interface ExpensesTableProps {
  plannerId: string;
  scenario?: string;
  onNavigateToTab?: (tabIndex: number) => void;
}

export const ExpensesTable: React.FC<ExpensesTableProps> = ({ plannerId, scenario = 'ALL' }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ExpenseCreate>>({
    name: '', include_toggle: 'on', scenario: 'ALL', monthly_amount: 0, notes: ''
  });

  const { data: expenses, isLoading, error } = useExpenses(plannerId, scenario);
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

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
      await updateExpense.mutateAsync({ id, [field]: value });
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleRowDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.monthly_amount === undefined) return;

    try {
      if (editingId) {
        await updateExpense.mutateAsync({ id: editingId, ...formData });
        setEditingId(null);
      } else {
        await createExpense.mutateAsync({ ...formData, planner_id: plannerId } as ExpenseCreate);
        setIsAdding(false);
      }
      setFormData({ name: '', include_toggle: 'on', scenario: 'ALL', monthly_amount: 0, notes: '' });
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };



  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', include_toggle: 'on', scenario: 'ALL', monthly_amount: 0, notes: '' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Expenses</h3>
          <p className="text-gray-600">Loading your expenses data...</p>
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
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Error Loading Expenses</h3>
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

  const expensesList = expenses || [];

  // Prepare data for enhanced table
  const tableData: TableRow[] = expensesList.map(expense => ({
    id: expense.id,
    name: expense.name,
    monthly_amount: expense.monthly_amount,
    include_toggle: expense.include_toggle,
    scenario: expense.scenario,
    notes: expense.notes || ''
  }));

  // Prepare summary data
  const totalMonthlyAmount = expensesList.length > 0 
    ? expensesList.reduce((sum, expense) => sum + (expense.monthly_amount || 0), 0)
    : 0;
    
  const summaryData = [
    { label: 'Total Expenses', value: expensesList.length },
    { label: 'Total Monthly Amount', value: `€${totalMonthlyAmount.toLocaleString()}` },
    { label: 'Active Expenses', value: expensesList.filter(expense => expense.include_toggle === 'on').length, color: 'text-green-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Expenses</h3>
          <p className="text-gray-600 mt-1">
            Manage your monthly expenses across different scenarios.
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.monthly_amount || ''}
                onChange={(e) => setFormData({ ...formData, monthly_amount: parseFloat(e.target.value) || 0 })}
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
              disabled={createExpense.isPending || updateExpense.isPending}
            >
              {createExpense.isPending || updateExpense.isPending ? 'Saving...' : (editingId ? 'Update' : 'Add')}
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
        addButtonText="Add Expense"
        emptyMessage="No expenses found. Add your first expense to get started."
        summaryData={summaryData}
      />
    </div>
  );
};

export default ExpensesTable;
