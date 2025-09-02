import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export interface Income {
  id: string;
  planner_id: string;
  name: string;
  include_toggle: 'on' | 'off';
  scenario: 'ALL' | 'A' | 'B' | 'C';
  monthly_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface IncomeCreate {
  planner_id: string;
  name: string;
  include_toggle: 'on' | 'off';
  scenario: 'ALL' | 'A' | 'B' | 'C';
  monthly_amount: number;
  notes?: string;
}

export interface IncomeUpdate {
  name?: string;
  include_toggle?: 'on' | 'off';
  scenario?: 'ALL' | 'A' | 'B' | 'C';
  monthly_amount?: number;
  notes?: string;
}

// Fetch income
export const useIncome = (plannerId: string) => {
  return useQuery({
    queryKey: ['income', plannerId], // Remove scenario from query key to always fetch all income
    queryFn: async (): Promise<Income[]> => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/income`, {
          params: { planner_id: plannerId, scenario: 'ALL' } // Always fetch ALL scenario data
        });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(`Failed to fetch income: ${error.response?.data?.detail || error.message}`);
        }
        throw new Error('Failed to fetch income');
      }
    },
    enabled: !!plannerId,
  });
};

// Create income
export const useCreateIncome = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (income: IncomeCreate): Promise<Income> => {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/v1/income`, income);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(`Failed to create income: ${error.response?.data?.detail || error.message}`);
        }
        throw new Error('Failed to create income');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
    },
  });
};

// Update income
export const useUpdateIncome = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...income }: { id: string } & IncomeUpdate): Promise<Income> => {
      try {
        const response = await axios.put(`${API_BASE_URL}/api/v1/income/${id}`, income);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(`Failed to update income: ${error.response?.data?.detail || error.message}`);
        }
        throw new Error('Failed to update income');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
    },
  });
};

// Delete income
export const useDeleteIncome = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      try {
        await axios.delete(`${API_BASE_URL}/api/v1/income/${id}`);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(`Failed to delete income: ${error.response?.data?.detail || error.message}`);
        }
        throw new Error('Failed to delete income');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
    },
  });
};
