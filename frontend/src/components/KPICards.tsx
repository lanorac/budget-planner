import { useMonthlyTotals } from '../hooks/useKPIs'

// Temporary planner ID for development - in real app this would come from context/auth
const TEMP_PLANNER_ID = "550e8400-e29b-41d4-a716-446655440000"

interface KPICardsProps {
  onNavigateToTab?: (tabIndex: number) => void
}

export default function KPICards({ onNavigateToTab }: KPICardsProps) {
  const { data: kpiData, isLoading, error } = useMonthlyTotals(TEMP_PLANNER_ID)

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
    asset_sales: 0
  }

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Financial Summary</h3>
        <p className="text-gray-600">Your current financial position across all scenarios</p>
      </div>
      
      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
            <p className="text-2xl font-bold text-gray-900">€{totals.monthly_income.toLocaleString()}</p>
            <p className="text-xs text-green-600 font-medium">Active income sources</p>
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
            <p className="text-2xl font-bold text-gray-900">€{totals.monthly_expenses.toLocaleString()}</p>
            <p className="text-xs text-red-600 font-medium">Regular expenses</p>
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
            <p className="text-2xl font-bold text-gray-900">€{totals.monthly_liabilities.toLocaleString()}</p>
            <p className="text-xs text-orange-600 font-medium">Debt payments</p>
            <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to view →</p>
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="kpi-card group">
          <div className="flex flex-col items-center text-center">
            <div className="kpi-icon bg-blue-600 mb-3">
              <span className="text-white text-xl">📈</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Net Cash Flow</p>
            <p className={`text-2xl font-bold ${totals.net_cash_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{totals.net_cash_flow.toLocaleString()}
            </p>
            <p className={`text-xs font-medium ${totals.net_cash_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totals.net_cash_flow >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
            </p>
          </div>
        </div>

        {/* Asset Sales - Clickable */}
        <div 
          className="kpi-card group cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 border-2 border-transparent hover:border-yellow-200"
          onClick={() => handleCardClick(1)} // Assets tab
          title="Click to view Assets details"
        >
          <div className="flex flex-col items-center text-center">
            <div className="kpi-icon bg-yellow-600 mb-3">
              <span className="text-white text-xl">🏠</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Asset Sales</p>
            <p className="text-2xl font-bold text-gray-900">€{totals.asset_sales.toLocaleString()}</p>
            <p className="text-xs text-yellow-600 font-medium">Total asset value</p>
            <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to view →</p>
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

