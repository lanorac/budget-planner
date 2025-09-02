import React, { useState } from 'react'
import { useScenarios, useCreateScenario, useUpdateScenario, useDeleteScenario, type Scenario, type ScenarioCreate } from '../hooks/useScenarios'

interface ScenarioManagementModalProps {
  isOpen: boolean
  onClose: () => void
  plannerId: string
}

export default function ScenarioManagementModal({ isOpen, onClose, plannerId }: ScenarioManagementModalProps) {
  const { data: scenarios = [], isLoading, error } = useScenarios(plannerId)
  const createScenario = useCreateScenario()
  const updateScenario = useUpdateScenario()
  const deleteScenario = useDeleteScenario()

  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null)
  const [formData, setFormData] = useState<ScenarioCreate>({
    scenario: '',
    display_name: '',
    sale_month: 0,
    planner_id: plannerId
  })

  const handleAddNew = () => {
    setEditingScenario(null)
    setFormData({
      scenario: '',
      display_name: '',
      sale_month: 0,
      planner_id: plannerId
    })
  }

  const handleEdit = (scenario: Scenario) => {
    setEditingScenario(scenario)
    setFormData({
      scenario: scenario.scenario,
      display_name: scenario.display_name,
      sale_month: scenario.sale_month,
      planner_id: plannerId
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingScenario) {
        await updateScenario.mutateAsync({ id: editingScenario.id, ...formData })
      } else {
        await createScenario.mutateAsync(formData)
      }
      setEditingScenario(null)
      setFormData({
        scenario: '',
        display_name: '',
        sale_month: 0,
        planner_id: plannerId
      })
    } catch (error) {
      console.error('Error saving scenario:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this scenario? This will also remove all items from this scenario.')) {
      try {
        await deleteScenario.mutateAsync(id)
      } catch (error) {
        console.error('Error deleting scenario:', error)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Manage Scenarios
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Add/Edit Form */}
          <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">
              {editingScenario ? 'Edit Scenario' : 'Add New Scenario'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scenario ID</label>
                <input
                  type="text"
                  value={formData.scenario}
                  onChange={(e) => setFormData({ ...formData, scenario: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="A, B, C, etc."
                  required
                  disabled={!!editingScenario} // Can't change ID after creation
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Sell House"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sale Month</label>
                <select
                  value={formData.sale_month}
                  onChange={(e) => setFormData({ ...formData, sale_month: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={0}>No Sales</option>
                  <option value={1}>Month 1</option>
                  <option value={2}>Month 2</option>
                  <option value={3}>Month 3</option>
                  <option value={4}>Month 4</option>
                  <option value={5}>Month 5</option>
                  <option value={6}>Month 6</option>
                  <option value={7}>Month 7</option>
                  <option value={8}>Month 8</option>
                  <option value={9}>Month 9</option>
                  <option value={10}>Month 10</option>
                  <option value={11}>Month 11</option>
                  <option value={12}>Month 12</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                disabled={createScenario.isPending || updateScenario.isPending}
              >
                {createScenario.isPending || updateScenario.isPending ? 'Saving...' : (editingScenario ? 'Update' : 'Add')}
              </button>
              {editingScenario && (
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          {/* Scenarios List */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Current Scenarios</h4>
            
            {isLoading ? (
              <div className="text-center py-4">Loading scenarios...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-600">Error loading scenarios</div>
            ) : scenarios.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No scenarios found</div>
            ) : (
              <div className="space-y-2">
                {scenarios.map((scenario) => (
                  <div key={scenario.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{scenario.display_name}</div>
                      <div className="text-sm text-gray-500">
                        ID: {scenario.scenario} • Sale Month: {scenario.sale_month === 0 ? 'No Sales' : `Month ${scenario.sale_month}`}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(scenario)}
                        className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(scenario.id)}
                        className="text-red-600 hover:text-red-800 px-3 py-1 rounded"
                        disabled={deleteScenario.isPending}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
