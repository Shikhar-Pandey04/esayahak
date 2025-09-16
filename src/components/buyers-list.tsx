'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { CsvImportExport } from './csv-import-export';

interface Buyer {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  city: string;
  propertyType: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline: string;
  status: string;
  updatedAt: string;
  ownerId: string;
}

interface BuyersResponse {
  buyers: Buyer[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

interface SearchParams {
  search?: string;
  city?: string;
  propertyType?: string;
  status?: string;
  timeline?: string;
  page?: string;
  sortBy?: string;
  sortOrder?: string;
}

export function BuyersList({ searchParams }: { searchParams: SearchParams }) {
  const { data: session } = useSession();
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [data, setData] = useState<BuyersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: searchParams.search || '',
    city: searchParams.city || '',
    propertyType: searchParams.propertyType || '',
    status: searchParams.status || '',
    timeline: searchParams.timeline || '',
  });

  const fetchBuyers = useCallback(async () => {
    if (!session?.user?.email) return;
    
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      const response = await fetch(`/api/buyers?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch buyers');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [searchParams, session?.user?.email]);

  useEffect(() => {
    fetchBuyers();
  }, [fetchBuyers]);

  const updateURL = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams(urlSearchParams);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    // Reset to page 1 when filters change
    if (Object.keys(newFilters).some(key => key !== 'page')) {
      params.set('page', '1');
    }

    router.push(`/buyers?${params.toString()}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL({ [key]: value });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL({ search: filters.search });
  };

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return '-';
    if (min && max) return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    if (min) return `₹${min.toLocaleString()}+`;
    return `Up to ₹${max?.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const canEdit = (buyer: Buyer) => {
    return session?.user?.email === buyer.ownerId;
  };

  if (!session) {
    return <div className="p-6">Please sign in to view buyers.</div>;
  }

  if (loading) {
    return <div className="p-6">Loading buyers...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="mb-6 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
          >
            <option value="">All Cities</option>
            <option value="Chandigarh">Chandigarh</option>
            <option value="Mohali">Mohali</option>
            <option value="Zirakpur">Zirakpur</option>
            <option value="Panchkula">Panchkula</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={filters.propertyType}
            onChange={(e) => handleFilterChange('propertyType', e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
          >
            <option value="">All Property Types</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Plot">Plot</option>
            <option value="Office">Office</option>
            <option value="Retail">Retail</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Qualified">Qualified</option>
            <option value="Contacted">Contacted</option>
            <option value="Visited">Visited</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Converted">Converted</option>
            <option value="Dropped">Dropped</option>
          </select>

          <select
            value={filters.timeline}
            onChange={(e) => handleFilterChange('timeline', e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
          >
            <option value="">All Timelines</option>
            <option value="0-3m">0-3 months</option>
            <option value="3-6m">3-6 months</option>
            <option value=">6m">&gt;6 months</option>
            <option value="Exploring">Exploring</option>
          </select>
        </div>
      </div>

      {/* CSV Import/Export */}
      <div className="mb-6">
        <CsvImportExport />
      </div>

      {/* Results */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-700">
          Showing {data?.buyers.length || 0} of {data?.totalCount || 0} buyers
        </p>
        <Link
          href="/buyers/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add Buyer
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timeline
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.buyers.map((buyer) => (
              <tr key={buyer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{buyer.fullName}</div>
                    {buyer.email && <div className="text-sm text-gray-500">{buyer.email}</div>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {buyer.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {buyer.city}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {buyer.propertyType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatBudget(buyer.budgetMin, buyer.budgetMax)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {buyer.timeline}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    buyer.status === 'New' ? 'bg-blue-100 text-blue-800' :
                    buyer.status === 'Qualified' ? 'bg-green-100 text-green-800' :
                    buyer.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                    buyer.status === 'Visited' ? 'bg-purple-100 text-purple-800' :
                    buyer.status === 'Negotiation' ? 'bg-orange-100 text-orange-800' :
                    buyer.status === 'Converted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {buyer.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(buyer.updatedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`/buyers/${buyer.id}`}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    View
                  </Link>
                  {canEdit(buyer) && (
                    <Link
                      href={`/buyers/${buyer.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Page {data.currentPage} of {data.totalPages}
          </div>
          <div className="flex space-x-2">
            {data.currentPage > 1 && (
              <button
                onClick={() => updateURL({ page: String(data.currentPage - 1) })}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                Previous
              </button>
            )}
            {data.currentPage < data.totalPages && (
              <button
                onClick={() => updateURL({ page: String(data.currentPage + 1) })}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}

      {data?.buyers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No buyers found matching your criteria.</p>
          <Link
            href="/buyers/new"
            className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add First Buyer
          </Link>
        </div>
      )}
    </div>
  );
}
