import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

export interface Asset {
  id: string
  name: string
  include_toggle: 'on' | 'off'
  scenario: 'ALL' | 'A' | 'B' | 'C'
  sale_value: number
  notes?: string
  planner_id: string
  created_at: string
  updated_at: string
}

export interface CreateAssetRequest {
  name: string
  include_toggle: 'on' | 'off'
  scenario: 'ALL' | 'A' | 'B' | 'C'
  sale_value: number
  notes?: string
  planner_id: string
}

export interface UpdateAssetRequest {
  name?: string
  include_toggle?: 'on' | 'off'
  scenario?: 'ALL' | 'A' | 'B' | 'C'
  sale_value?: number
  notes?: string
}

// API functions
const fetchAssets = async (plannerId: string, scenario: string = 'ALL'): Promise<Asset[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/assets`, {
      params: { planner_id: plannerId, scenario },
      timeout: 5000 // 5 second timeout
    })
    return response.data
  } catch (error) {
    console.error('Error fetching assets:', error)
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        throw new Error('Backend server is not running. Please start the backend server first.')
      }
      throw new Error(`API Error: ${error.response?.data?.detail || error.message}`)
    }
    throw error
  }
}

const createAsset = async (asset: CreateAssetRequest): Promise<Asset> => {
  const response = await axios.post(`${API_BASE_URL}/api/v1/assets`, asset)
  return response.data
}

const updateAsset = async ({ id, ...asset }: { id: string } & UpdateAssetRequest): Promise<Asset> => {
  const response = await axios.put(`${API_BASE_URL}/api/v1/assets/${id}`, asset)
  return response.data
}

const deleteAsset = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/api/v1/assets/${id}`)
}

// Custom hooks
export const useAssets = (plannerId: string) => {
  return useQuery({
    queryKey: ['assets', plannerId], // Remove scenario from query key to always fetch all assets
    queryFn: () => fetchAssets(plannerId, 'ALL'), // Always fetch ALL scenario data
    enabled: !!plannerId,
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retry
  })
}

export const useCreateAsset = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      // Invalidate and refetch assets queries
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}

export const useUpdateAsset = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateAsset,
    onSuccess: () => {
      // Invalidate and refetch assets queries
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}

export const useDeleteAsset = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => {
      // Invalidate and refetch assets queries
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}
