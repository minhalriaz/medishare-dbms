import {
  OrganizationDirectoryItem,
  OrganizationStatistics,
  InventoryOverviewItem,
  MedicineInventoryItem,
  UserOrganizationRelationship,
  CompleteDirectoryItem,
  StockSummaryItem,
  OrganizationDetails,
} from '../types/organization';
import { getApiBaseUrl } from '@/lib/apiBase';

const BASE_URL = getApiBaseUrl();

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`);

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      `Request failed (${response.status}): ${message}`,
    );
  }

  return response.json() as Promise<T>;
}

export const organizationApi = {
  // INNER JOIN
  getDirectory(): Promise<OrganizationDirectoryItem[]> {
    return request<OrganizationDirectoryItem[]>(
      '/organizations',
    );
  },

  // Aggregate functions + LEFT OUTER JOIN
  getStatistics(): Promise<OrganizationStatistics[]> {
    return request<OrganizationStatistics[]>(
      '/organizations/statistics',
    );
  },

  // Raw SQL search
  searchOrganizations(
    query: string,
  ): Promise<OrganizationDirectoryItem[]> {
    return request<OrganizationDirectoryItem[]>(
      `/organizations/search?query=${encodeURIComponent(query)}`,
    );
  },

  // LEFT OUTER JOIN
  getInventoryOverview(): Promise<InventoryOverviewItem[]> {
    return request<InventoryOverviewItem[]>(
      '/organizations/inventory-overview',
    );
  },

  // 4-table INNER JOIN
  getMedicineInventory(): Promise<MedicineInventoryItem[]> {
    return request<MedicineInventoryItem[]>(
      '/organizations/medicine-inventory',
    );
  },

  // RIGHT OUTER JOIN
  getUserRelationship(): Promise<
    UserOrganizationRelationship[]
  > {
    return request<UserOrganizationRelationship[]>(
      '/organizations/user-relationship',
    );
  },

  // FULL OUTER JOIN equivalent
  getCompleteDirectory(): Promise<CompleteDirectoryItem[]> {
    return request<CompleteDirectoryItem[]>(
      '/organizations/complete-directory',
    );
  },

  // GROUP BY + HAVING
  getSufficientStock(): Promise<StockSummaryItem[]> {
    return request<StockSummaryItem[]>(
      '/organizations/sufficient-stock',
    );
  },

  // SUBQUERY + AVG + SUM
  getAboveAverageStock(): Promise<StockSummaryItem[]> {
    return request<StockSummaryItem[]>(
      '/organizations/above-average-stock',
    );
  },
    createOrganization(data: {
    full_name: string;
    email: string;
    phone?: string;
    address?: string;

    organization_name: string;
    organization_type: string;
    licence_number: string;
    organization_address?: string;
    verification_status?: string;
  }) {
    return fetch(`${BASE_URL}/organizations`, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(data),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.message ||
            'Failed to create organization',
        );
      }

      return response.json();
    });
  },
    getOrganizationById(
    id: number,
  ): Promise<OrganizationDetails> {
    return request<OrganizationDetails>(
      `/organizations/${id}`,
    );
  },

  async updateOrganization(
    id: number,
    data: {
      full_name: string;
      email: string;
      phone?: string;
      address?: string;

      organization_name: string;
      organization_type: string;
      licence_number: string;
      organization_address?: string;
      verification_status: string;
    },
  ) {
    const response = await fetch(
      `${BASE_URL}/organizations/${id}`,
      {
        method: 'PUT',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(
        errorData.message ||
          'Failed to update organization',
      );
    }

    return response.json();
  },
    async deleteOrganization(id: number) {
    const response = await fetch(
      `${BASE_URL}/organizations/${id}`,
      {
        method: 'DELETE',
      },
    );

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(
        errorData.message ||
          'Failed to delete organization',
      );
    }

    return response.json();
  },
};