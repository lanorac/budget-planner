import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export interface Liability {
  id: string;
  planner_id: string;
  name: string;
  include_toggle: 'on' | 'off';
  scenario: 'ALL' | 'A' | 'B' | 'C';
  monthly_cost: number;
  principal?: number;
  linked_asset_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LiabilityCreate {
  planner_id: string;
  name: string;
  include_toggle: 'on' | 'off';
  scenario: 'ALL' | 'A' | 'B' | 'C';
  monthly_cost: number;
  principal?: number;
  linked_asset_id?: string;
  notes?: string;
}

export interface LiabilityUpdate {
  name?: string;
  include_toggle?: 'on' | 'off';
  scenario?: 'ALL' | 'A' | 'B' | 'C';
  monthly_cost?: number;
  principal?: number;
  linked_asset_id?: string;
  notes?: string;
}

// Fetch liabilities
export const useLiabilities = (plannerId: string) => {
  return useQuery({
    queryKey: ['liabilities', plannerId, 'v2'], // Add version to force cache invalidation
    queryFn: async (): Promise<Liability[]> => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/liabilities`, {
          params: { planner_id: plannerId, scenario: 'ALL' } // Always fetch ALL scenario data
        });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(`Failed to fetch liabilities: ${error.response?.data?.detail || error.message}`);
        }
        throw new Error('Failed to fetch liabilities');
      }
    },
    enabled: !!plannerId,
    staleTime: 0, // Force refetch every time
  });
};

// Create liability
export const useCreateLiability = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (liability: LiabilityCreate): Promise<Liability> => {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/v1/liabilities`, liability);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(`Failed to create liability: ${error.response?.data?.detail || error.message}`);
        }
        throw new Error('Failed to create liability');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
    },
  });
};

// Update liability
export const useUpdateLiability = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...liability }: { id: string } & LiabilityUpdate): Promise<Liability> => {
      try {
        const response = await axios.put(`${API_BASE_URL}/api/v1/liabilities/${id}`, liability);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(`Failed to update liability: ${error.response?.data?.detail || error.message}`);
        }
        throw new Error('Failed to update liability');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
    },
  });
};

// Delete liability
export const useDeleteLiability = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      try {
        await axios.delete(`${API_BASE_URL}/api/v1/liabilities/${id}`);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(`Failed to delete liability: ${error.response?.data?.detail || error.message}`);
        }
        throw new Error('Failed to delete liability');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
    },
  });
};
