import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api/v1'

export interface MonthlyTotals {
  monthly_income: number
  monthly_expenses: number
  monthly_bills: number
  monthly_liabilities: number
  total_monthly_outgoings: number
  net_cash_flow: number
  asset_sales: number
}

export interface KPITotalsResponse {
  planner_id: string
  scenario: string
  totals: MonthlyTotals
}

// API functions
const fetchMonthlyTotals = async (plannerId: string, scenario: string = 'ALL'): Promise<KPITotalsResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/kpis/monthly-totals`, {
      params: { planner_id: plannerId, scenario },
      timeout: 5000 // 5 second timeout
    })
    return response.data
  } catch (error) {
    console.error('Error fetching monthly totals:', error)
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        throw new Error('Backend server is not running. Please start the backend server first.')
      }
      throw new Error(`API Error: ${error.response?.data?.detail || error.message}`)
    }
    throw error
  }
}

// Custom hooks
export const useMonthlyTotals = (plannerId: string, scenario: string = 'ALL') => {
  return useQuery({
    queryKey: ['monthly-totals', plannerId, scenario],
    queryFn: () => fetchMonthlyTotals(plannerId, scenario),
    enabled: !!plannerId,
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retry
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  })
}
