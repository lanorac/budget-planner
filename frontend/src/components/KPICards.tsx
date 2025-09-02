import { useMonthlyTotals } from '../hooks/useKPIs'

// Temporary planner ID for development - in real app this would come from context/auth
const TEMP_PLANNER_ID = "550e8400-e29b-41d4-a716-446655440000"

interface KPICardsProps {
  onNavigateToTab?: (tabIndex: number) => void
  selectedScenario?: string
  onScenarioChange?: (scenario: string) => void
  onOpenScenarioModal?: () => void
  scenarios?: Array<{ id: string; scenario: string; display_name: string }>
}

export default function KPICards({ onNavigateToTab, selectedScenario, onScenarioChange, onOpenScenarioModal, scenarios }: KPICardsProps) {
  const { data: kpiData, isLoading, error } = useMonthlyTotals(TEMP_PLANNER_ID, selectedScenario)

  const handleCardClick = (tabIndex: number) => {
    if (onNavigateToTab) {
      onNavigateToTab(tabIndex)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Financial Summary</h3>
          <p className="text-gray-600">Loading your financial data...</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="kpi-card animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-shrink-0">
                  <div className="kpi-icon bg-gray-300"></div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-32"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Error Loading KPIs</h3>
          <p className="text-gray-500 mb-4">Unable to load financial data. Please check:</p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>Make sure the backend server is running on port 3000</li>
            <li>Check your internet connection</li>
            <li>Try refreshing the page</li>
          </ul>
        </div>
      </div>
    )
  }

  const totals = kpiData?.totals || {
    monthly_income: 0,
    monthly_expenses: 0,
    monthly_bills: 0,
    monthly_liabilities: 0,
    total_monthly_outgoings: 0,
    net_cash_flow: 0,
    asset_sales: 0,
    liability_principal: 0,
    net_value: 0
  }

  // Helper function to safely format numbers
  const formatCurrency = (value: number | undefined) => {
    return `€${(value || 0).toLocaleString()}`
  }

  // Update header text based on selected scenario
  const getHeaderText = () => {
    if (selectedScenario && selectedScenario !== 'ALL') {
      return `Financial Summary - ${selectedScenario} Scenario`
    }
    return "Financial Summary - All Scenarios"
  }

  const getSubheaderText = () => {
    if (selectedScenario && selectedScenario !== 'ALL') {
      return `Your financial position filtered by the ${selectedScenario} scenario`
    }
    return "Your current financial position across all scenarios"
  }

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{getHeaderText()}</h3>
        <p className="text-gray-600">{getSubheaderText()}</p>
      </div>

      {/* Scenario Selector and Management */}
      {scenarios && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label htmlFor="scenario-select" className="text-sm font-medium text-gray-700">
                Active Scenario:
              </label>
              <select
                id="scenario-select"
                value={selectedScenario || 'ALL'}
                onChange={(e) => onScenarioChange?.(e.target.value)}
                className="block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="ALL">All Scenarios</option>
                {scenarios.map((scenario) => (
                  <option key={scenario.id} value={scenario.scenario}>
                    {scenario.display_name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={onOpenScenarioModal}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add/Edit Scenarios
            </button>
          </div>
          
          {selectedScenario && selectedScenario !== 'ALL' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The Overview tab shows calculations filtered by the selected scenario. 
                All other tabs display all data for editing purposes.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* KPI Grid - Three Rows */}
      <div className="space-y-6">
        {/* Row 1: Monthly Cash Flow */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Monthly Income - Clickable */}
          <div 
            className="kpi-card group cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 border-2 border-transparent hover:border-green-200"
            onClick={() => handleCardClick(3)} // Income tab
            title="Click to view Income details"
          >
            <div className="flex flex-col items-center text-center">
              <div className="kpi-icon bg-green-600 mb-3">
                <span className="text-white text-xl">💰</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Monthly Income</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.monthly_income)}</p>
              <p className="text-xs text-green-600 font-medium">Active income sources</p>
              <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to view →</p>
            </div>
          </div>

          {/* Monthly Liabilities - Clickable */}
          <div 
            className="kpi-card group cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 border-2 border-transparent hover:border-orange-200"
            onClick={() => handleCardClick(2)} // Liabilities tab
            title="Click to view Liabilities details"
          >
            <div className="flex flex-col items-center text-center">
              <div className="kpi-icon bg-orange-600 mb-3">
                <span className="text-white text-xl">💳</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Monthly Liabilities</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.monthly_liabilities)}</p>
              <p className="text-xs text-orange-600 font-medium">Debt payments</p>
              <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to view →</p>
            </div>
          </div>

          {/* Monthly Bills - Clickable (when implemented) */}
          <div 
            className="kpi-card group cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 border-2 border-transparent hover:border-purple-200"
            onClick={() => handleCardClick(5)} // Bills tab (when implemented)
            title="Click to view Bills details"
          >
            <div className="flex flex-col items-center text-center">
              <div className="kpi-icon bg-purple-600 mb-3">
                <span className="text-white text-xl">📋</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Monthly Bills</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.monthly_bills)}</p>
              <p className="text-xs text-purple-600 font-medium">Regular bills</p>
              <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to view →</p>
            </div>
          </div>

          {/* Monthly Expenses - Clickable */}
          <div 
            className="kpi-card group cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 border-2 border-transparent hover:border-red-200"
            onClick={() => handleCardClick(4)} // Expenses tab
            title="Click to view Expenses details"
          >
            <div className="flex flex-col items-center text-center">
              <div className="kpi-icon bg-red-600 mb-3">
                <span className="text-white text-xl">📊</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.monthly_expenses)}</p>
              <p className="text-xs text-red-600 font-medium">Regular expenses</p>
              <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to view →</p>
            </div>
          </div>
        </div>

        {/* Row 2: Asset and Liability Values */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Total Asset Value - Clickable */}
          <div 
            className="kpi-card group cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 border-2 border-transparent hover:border-yellow-200"
            onClick={() => handleCardClick(1)} // Assets tab
            title="Click to view Assets details"
          >
            <div className="flex flex-col items-center text-center">
              <div className="kpi-icon bg-yellow-600 mb-3">
                <span className="text-white text-xl">🏠</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Total Asset Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.asset_sales)}</p>
              <p className="text-xs text-yellow-600 font-medium">Asset sales value</p>
              <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to view →</p>
            </div>
          </div>

          {/* Total Liability Principal - Clickable */}
          <div 
            className="kpi-card group cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 border-2 border-transparent hover:border-orange-200"
            onClick={() => handleCardClick(2)} // Liabilities tab
            title="Click to view Liabilities details"
          >
            <div className="flex flex-col items-center text-center">
              <div className="kpi-icon bg-orange-600 mb-3">
                <span className="text-white text-xl">💳</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Total Liability Principal</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.liability_principal)}</p>
              <p className="text-xs text-orange-600 font-medium">Total debt amount</p>
              <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to view →</p>
            </div>
          </div>
        </div>

        {/* Row 3: Net Values */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Monthly Balance - Income vs Expenses */}
          <div className="kpi-card group">
            <div className="flex flex-col items-center text-center">
              <div className="kpi-icon bg-blue-600 mb-3">
                <span className="text-white text-xl">📈</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Monthly Balance</p>
              <p className={`text-2xl font-bold ${totals.net_cash_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totals.net_cash_flow)}
              </p>
              <p className={`text-xs font-medium ${(totals.net_cash_flow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(totals.net_cash_flow || 0) >= 0 ? 'Income > Expenses' : 'Expenses > Income'}
              </p>
            </div>
          </div>

          {/* Net Value - Assets vs Liabilities */}
          <div className="kpi-card group">
            <div className="flex flex-col items-center text-center">
              <div className="kpi-icon bg-indigo-600 mb-3">
                <span className="text-white text-xl">⚖️</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Net Value</p>
              <p className={`text-2xl font-bold ${totals.net_value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totals.net_value)}
              </p>
              <p className={`text-xs font-medium ${(totals.net_value || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(totals.net_value || 0) >= 0 ? 'Assets > Liabilities' : 'Liabilities > Assets'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h4 className="text-lg font-semibold text-gray-800">Quick Actions</h4>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              className="btn-success cursor-pointer hover:shadow-lg transition-all duration-200"
              onClick={() => handleCardClick(1)} // Assets tab
            >
              <span className="mr-2">➕</span>
              Add New Asset
            </button>
            <button className="btn-primary">
              <span className="mr-2">📊</span>
              View Reports
            </button>
            <button className="btn-secondary">
              <span className="mr-2">📥</span>
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

