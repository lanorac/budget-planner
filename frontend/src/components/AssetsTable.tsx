import { useAssets, useDeleteAsset } from '../hooks/useAssets'
import type { Asset } from '../hooks/useAssets'

// Temporary planner ID for development - in real app this would come from context/auth
const TEMP_PLANNER_ID = "550e8400-e29b-41d4-a716-446655440000"

export default function AssetsTable() {
  const { data: assets, isLoading, error } = useAssets(TEMP_PLANNER_ID)
  const deleteAssetMutation = useDeleteAsset()

  const handleDeleteAsset = async (assetId: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await deleteAssetMutation.mutateAsync(assetId)
      } catch (error) {
        console.error('Error deleting asset:', error)
        alert('Failed to delete asset. Please try again.')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Assets</h3>
            <p className="text-gray-600 mt-1">Loading your assets...</p>
          </div>
        </div>
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="table-header">Name</th>
                  <th className="table-header">Include</th>
                  <th className="table-header">Scenario</th>
                  <th className="table-header">Sale Value</th>
                  <th className="table-header">Notes</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-lg mr-3"></div>
                        <div className="h-4 bg-gray-300 rounded w-24"></div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="h-6 bg-gray-300 rounded w-12"></div>
                    </td>
                    <td className="table-cell">
                      <div className="h-6 bg-gray-300 rounded w-8"></div>
                    </td>
                    <td className="table-cell">
                      <div className="h-4 bg-gray-300 rounded w-20"></div>
                    </td>
                    <td className="table-cell">
                      <div className="h-4 bg-gray-300 rounded w-32"></div>
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <div className="w-5 h-5 bg-gray-300 rounded"></div>
                        <div className="w-5 h-5 bg-gray-300 rounded"></div>
                      </div>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Assets</h3>
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
        </div>
      </div>
    )
  }

  const assetsList = assets || []

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
        <div className="flex space-x-3">
          <button className="btn-secondary">
            <span className="mr-2">🔍</span>
            Filter
          </button>
          <button className="btn-primary">
            <span className="mr-2">➕</span>
            Add Asset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Include</th>
                <th className="table-header">Scenario</th>
                <th className="table-header">Sale Value</th>
                <th className="table-header">Notes</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assetsList.map((asset: Asset) => (
                <tr key={asset.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="table-cell">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">🏠</span>
                      </div>
                      <span className="font-medium text-gray-900">{asset.name}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge-${asset.include_toggle === 'on' ? 'success' : 'warning'}`}>
                      <span className="mr-1">{asset.include_toggle === 'on' ? '✓' : '✗'}</span>
                      {asset.include_toggle === 'on' ? 'On' : 'Off'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {asset.scenario}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="font-semibold text-gray-900">€{asset.sale_value.toLocaleString()}</span>
                  </td>
                  <td className="table-cell">
                    <span className="text-gray-600">{asset.notes || '-'}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 transition-colors duration-200">
                        <span className="text-lg">✏️</span>
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        onClick={() => handleDeleteAsset(asset.id)}
                        disabled={deleteAssetMutation.isPending}
                      >
                        <span className="text-lg">🗑️</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {assetsList.length === 0 && (
                <tr>
                  <td colSpan={6} className="table-cell text-center text-gray-500 py-8">
                    No assets found. Add your first asset to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary card */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">{assetsList.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                €{assetsList.reduce((sum, asset) => sum + asset.sale_value, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Active Sales</p>
              <p className="text-2xl font-bold text-green-600">
                {assetsList.filter(asset => asset.include_toggle === 'on').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
