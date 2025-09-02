import { useState } from 'react'
import { useBills, useCreateBill, useUpdateBill, useDeleteBill, type Bill, type BillCreate } from '../hooks/useBills'
import type { TableColumn, TableRow } from './shared/EnhancedTable'
import EnhancedTable from './shared/EnhancedTable'

// Temporary planner ID for development - in real app this would come from context/auth
const SAMPLE_PLANNER_ID = "550e8400-e29b-41d4-a716-446655440000"

export default function BillsTable() {
  const { data: bills = [], isLoading, error } = useBills(SAMPLE_PLANNER_ID)
  const createBill = useCreateBill()
  const updateBill = useUpdateBill()
  const deleteBill = useDeleteBill()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [formData, setFormData] = useState<BillCreate>({
    name: '',
    include_toggle: 'on',
    scenario: 'ALL',
    bill_amount: 0,
    interval_months: 1,
    category_id: undefined,
    linked_asset_id: undefined,
    linked_liability_id: undefined,
    notes: '',
    planner_id: SAMPLE_PLANNER_ID
  })

  const handleAddNew = () => {
    setEditingBill(null)
    setFormData({
      name: '',
      include_toggle: 'on',
      scenario: 'ALL',
      bill_amount: 0,
      interval_months: 1,
      category_id: undefined,
      linked_asset_id: undefined,
      linked_liability_id: undefined,
      notes: '',
      planner_id: SAMPLE_PLANNER_ID
    })
    setIsFormOpen(true)
  }

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill)
    setFormData({
      name: bill.name,
      include_toggle: bill.include_toggle,
      scenario: bill.scenario,
      bill_amount: bill.bill_amount,
      interval_months: bill.interval_months,
      category_id: bill.category_id,
      linked_asset_id: bill.linked_asset_id,
      linked_liability_id: bill.linked_liability_id,
      notes: bill.notes || '',
      planner_id: bill.planner_id
    })
    setIsFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingBill) {
        await updateBill.mutateAsync({ id: editingBill.id, ...formData })
      } else {
        await createBill.mutateAsync(formData)
      }
      setIsFormOpen(false)
      setEditingBill(null)
    } catch (error) {
      console.error('Error saving bill:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await deleteBill.mutateAsync(id)
      } catch (error) {
        console.error('Error deleting bill:', error)
      }
    }
  }

  // Prepare data for EnhancedTable
  const billsList: TableRow[] = bills.map(bill => ({
    id: bill.id,
    name: bill.name,
    include_toggle: bill.include_toggle,
    scenario: bill.scenario,
    bill_amount: bill.bill_amount,
    interval_months: bill.interval_months,
    monthly_average: bill.monthly_average,
    notes: bill.notes || ''
  }))

  // Prepare summary data
  const totalMonthlyAverage = billsList.length > 0
    ? billsList.reduce((sum, bill) => sum + (bill.monthly_average || 0), 0)
    : 0

  const totalBillAmount = billsList.length > 0
    ? billsList.reduce((sum, bill) => sum + (bill.bill_amount || 0), 0)
    : 0

  const columns: TableColumn[] = [
    { key: 'name', label: 'Bill Name', type: 'text', editable: true },
    { key: 'bill_amount', label: 'Bill Amount', type: 'currency', editable: true },
    { key: 'interval_months', label: 'Interval (Months)', type: 'number', editable: true },
    { key: 'monthly_average', label: 'Monthly Average', type: 'currency', editable: false },
    { key: 'include_toggle', label: 'Include', type: 'toggle', editable: true },
    { key: 'scenario', label: 'Scenario', type: 'select', editable: true, options: ['ALL', 'A', 'B', 'C'] },
    { key: 'notes', label: 'Notes', type: 'text', editable: true },
    { key: 'actions', label: 'Actions', type: 'actions', editable: false }
  ]

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Error Loading Bills</h3>
          <p className="text-gray-500 mb-4">Unable to load bill data. Please check:</p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>Make sure the backend server is running on port 3000</li>
            <li>Check your internet connection</li>
            <li>Try refreshing the page</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Bills</h3>
          <p className="mt-2 text-sm text-gray-700">
            Track your recurring household bills and utilities with flexible intervals.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Total Monthly Average</p>
              <p className="text-2xl font-bold text-blue-900">€{totalMonthlyAverage.toLocaleString()}</p>
              <p className="text-xs text-blue-600">Average monthly bill payments</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-800">Total Bill Amount</p>
              <p className="text-2xl font-bold text-green-900">€{totalBillAmount.toLocaleString()}</p>
              <p className="text-xs text-green-600">Sum of all bill amounts</p>
            </div>
          </div>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button 
            type="button" 
            className="btn-primary"
            onClick={handleAddNew}
          >
            Add Bill
          </button>
        </div>
      </div>

      <div className="mt-8">
        <EnhancedTable
          data={billsList}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSave={async (id, field, value) => {
            const bill = bills.find(b => b.id === id)
            if (bill) {
              await updateBill.mutateAsync({ id, [field]: value })
            }
          }}
        />
      </div>

      {/* Add/Edit Bill Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingBill ? 'Edit Bill' : 'Add New Bill'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bill Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Bill Amount (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.bill_amount}
                    onChange={(e) => setFormData({ ...formData, bill_amount: parseFloat(e.target.value) || 0 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Interval (Months)</label>
                  <select
                    value={formData.interval_months}
                    onChange={(e) => setFormData({ ...formData, interval_months: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value={1}>Monthly (1 month)</option>
                    <option value={2}>Every 2 months</option>
                    <option value={3}>Quarterly (3 months)</option>
                    <option value={4}>Every 4 months</option>
                    <option value={6}>Semi-annually (6 months)</option>
                    <option value={12}>Annually (12 months)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Include</label>
                  <select
                    value={formData.include_toggle}
                    onChange={(e) => setFormData({ ...formData, include_toggle: e.target.value as 'on' | 'off' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="on">Include</option>
                    <option value="off">Exclude</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Scenario</label>
                  <select
                    value={formData.scenario}
                    onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="ALL">All Scenarios</option>
                    <option value="A">Scenario A</option>
                    <option value="B">Scenario B</option>
                    <option value="C">Scenario C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={createBill.isPending || updateBill.isPending}
                  >
                    {createBill.isPending || updateBill.isPending ? 'Saving...' : 'Save Bill'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
