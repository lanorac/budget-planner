import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api/v1'

export interface Bill {
  id: string
  name: string
  include_toggle: 'on' | 'off'
  scenario: string
  bill_amount: number
  interval_months: number
  monthly_average: number
  category_id?: string
  linked_asset_id?: string
  linked_liability_id?: string
  notes?: string
  planner_id: string
  created_at: string
  updated_at: string
}

export interface BillCreate {
  name: string
  include_toggle: 'on' | 'off'
  scenario: string
  bill_amount: number
  interval_months: number
  category_id?: string
  linked_asset_id?: string
  linked_liability_id?: string
  notes?: string
  planner_id: string
}

export interface BillUpdate {
  name?: string
  include_toggle?: 'on' | 'off'
  scenario?: string
  bill_amount?: number
  interval_months?: number
  category_id?: string
  linked_asset_id?: string
  linked_liability_id?: string
  notes?: string
}

// API functions
const fetchBills = async (plannerId: string): Promise<Bill[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bills`, {
      params: { planner_id: plannerId, scenario: 'ALL' },
      timeout: 5000
    })
    return response.data
  } catch (error) {
    console.error('Error fetching bills:', error)
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        throw new Error('Backend server is not running. Please start the backend server first.')
      }
      throw new Error(`API Error: ${error.response?.data?.detail || error.message}`)
    }
    throw error
  }
}

const createBill = async (bill: BillCreate): Promise<Bill> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/bills`, bill, {
      timeout: 5000
    })
    return response.data
  } catch (error) {
    console.error('Error creating bill:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(`API Error: ${error.response?.data?.detail || error.message}`)
    }
    throw error
  }
}

const updateBill = async ({ id, ...bill }: { id: string } & BillUpdate): Promise<Bill> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/bills/${id}`, bill, {
      timeout: 5000
    })
    return response.data
  } catch (error) {
    console.error('Error updating bill:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(`API Error: ${error.response?.data?.detail || error.message}`)
    }
    throw error
  }
}

const deleteBill = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/bills/${id}`, {
      timeout: 5000
    })
  } catch (error) {
    console.error('Error deleting bill:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(`API Error: ${error.response?.data?.detail || error.message}`)
    }
    throw error
  }
}

// Custom hooks
export const useBills = (plannerId: string) => {
  return useQuery({
    queryKey: ['bills', plannerId],
    queryFn: () => fetchBills(plannerId),
    enabled: !!plannerId,
    retry: 1,
    retryDelay: 1000,
    refetchInterval: 30000,
  })
}

export const useCreateBill = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-totals'] })
    },
  })
}

export const useUpdateBill = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-totals'] })
    },
  })
}

export const useDeleteBill = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-totals'] })
    },
  })
}
