import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export interface Expense {
  id: string;
  planner_id: string;
  name: string;
  include_toggle: 'on' | 'off';
  scenario: 'ALL' | 'A' | 'B' | 'C';
  monthly_amount: number;
  category_id?: string;
  linked_asset_id?: string;
  linked_liab_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCreate {
  planner_id: string;
  name: string;
  include_toggle: 'on' | 'off';
  scenario: 'ALL' | 'A' | 'B' | 'C';
  monthly_amount: number;
  category_id?: string;
  linked_asset_id?: string;
  linked_liab_id?: string;
  notes?: string;
}

export interface ExpenseUpdate {
  name?: string;
  include_toggle?: 'on' | 'off';
  scenario?: 'ALL' | 'A' | 'B' | 'C';
  monthly_amount?: number;
  category_id?: string;
  linked_asset_id?: string;
  linked_liab_id?: string;
  notes?: string;
}

export const useExpenses = (plannerId: string, scenario: string = 'ALL') => {
  return useQuery({
    queryKey: ['expenses', plannerId, scenario],
    queryFn: async (): Promise<Expense[]> => {
      const response = await axios.get(`${API_BASE_URL}/api/v1/expenses`, {
        params: { planner_id: plannerId, scenario }
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (expense: ExpenseCreate): Promise<Expense> => {
      const response = await axios.post(`${API_BASE_URL}/api/v1/expenses`, expense);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...expense }: { id: string } & ExpenseUpdate): Promise<Expense> => {
      const response = await axios.put(`${API_BASE_URL}/api/v1/expenses/${id}`, expense);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await axios.delete(`${API_BASE_URL}/api/v1/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};
