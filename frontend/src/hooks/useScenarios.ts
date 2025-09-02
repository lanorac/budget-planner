import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api/v1'

export interface Scenario {
  id: string
  scenario: string
  display_name: string
  sale_month: number
  planner_id: string
  created_at: string
  updated_at: string
}

export interface ScenarioCreate {
  scenario: string
  display_name: string
  sale_month: number
  planner_id: string
}

export interface ScenarioUpdate {
  display_name?: string
  sale_month?: number
}

export interface ScenarioItem {
  id: string
  item_id: string
  item_type: 'asset' | 'liability' | 'income' | 'expense' | 'bill'
  scenario_id: string
  created_at: string
}

export interface ScenarioItemCreate {
  item_id: string
  item_type: 'asset' | 'liability' | 'income' | 'expense' | 'bill'
  scenario_id: string
}

// API functions
const fetchScenarios = async (plannerId: string): Promise<Scenario[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/scenarios`, {
      params: { planner_id: plannerId },
      timeout: 5000
    })
    return response.data
  } catch (error) {
    console.error('Error fetching scenarios:', error)
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        throw new Error('Backend server is not running. Please start the backend server first.')
      }
      throw new Error(`API Error: ${error.response?.data?.detail || error.message}`)
    }
    throw error
  }
}

const createScenario = async (scenario: ScenarioCreate): Promise<Scenario> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/scenarios`, scenario, {
      timeout: 5000
    })
    return response.data
  } catch (error) {
    console.error('Error creating scenario:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(`API Error: ${error.response?.data?.detail || error.message}`)
    }
    throw error
  }
}

const updateScenario = async ({ id, ...scenario }: { id: string } & ScenarioUpdate): Promise<Scenario> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/scenarios/${id}`, scenario, {
      timeout: 5000
    })
    return response.data
  } catch (error) {
    console.error('Error updating scenario:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(`API Error: ${error.response?.data?.detail || error.message}`)
    }
    throw error
  }
}

const deleteScenario = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/scenarios/${id}`, {
      timeout: 5000
    })
  } catch (error) {
    console.error('Error deleting scenario:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(`API Error: ${error.response?.data?.detail || error.message}`)
    }
    throw error
  }
}

const addItemToScenario = async (scenarioId: string, item: ScenarioItemCreate): Promise<ScenarioItem> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/scenarios/${scenarioId}/items`, item, {
      timeout: 5000
    })
    return response.data
  } catch (error) {
    console.error('Error adding item to scenario:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(`API Error: ${error.response?.data?.detail || error.message}`)
    }
    throw error
  }
}

const removeItemFromScenario = async (scenarioId: string, itemId: string, itemType: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/scenarios/${scenarioId}/items/${itemId}`, {
      params: { item_type: itemType },
      timeout: 5000
    })
  } catch (error) {
    console.error('Error removing item from scenario:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(`API Error: ${error.response?.data?.detail || error.message}`)
    }
    throw error
  }
}

// Custom hooks
export const useScenarios = (plannerId: string) => {
  return useQuery({
    queryKey: ['scenarios', plannerId],
    queryFn: () => fetchScenarios(plannerId),
    enabled: !!plannerId,
    retry: 1,
    retryDelay: 1000,
    refetchInterval: 30000,
  })
}

export const useCreateScenario = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createScenario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] })
    },
  })
}

export const useUpdateScenario = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateScenario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] })
    },
  })
}

export const useDeleteScenario = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteScenario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] })
    },
  })
}

export const useAddItemToScenario = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ scenarioId, item }: { scenarioId: string; item: ScenarioItemCreate }) => 
      addItemToScenario(scenarioId, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-totals'] })
    },
  })
}

export const useRemoveItemFromScenario = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ scenarioId, itemId, itemType }: { scenarioId: string; itemId: string; itemType: string }) => 
      removeItemFromScenario(scenarioId, itemId, itemType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-totals'] })
    },
  })
}
