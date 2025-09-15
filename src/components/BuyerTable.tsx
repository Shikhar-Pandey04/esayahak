import React from 'react';
import Link from 'next/link';
import { Buyer } from '@/lib/db';
import { BuyerStatus } from '@/lib/validations/buyer';

interface BuyerTableProps {
  buyers: Buyer[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function BuyerTable({ buyers, currentPage, totalPages, onPageChange, isLoading = false }: BuyerTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case BuyerStatus.NEW:
        return 'bg-blue-100 text-blue-800';
      case BuyerStatus.CONTACTED:
        return 'bg-yellow-100 text-yellow-800';
      case BuyerStatus.QUALIFIED:
        return 'bg-green-100 text-green-800';
      case BuyerStatus.PROPOSAL_SENT:
        return 'bg-purple-100 text-purple-800';
      case BuyerStatus.NEGOTIATION:
        return 'bg-orange-100 text-orange-800';
      case BuyerStatus.CLOSED_WON:
        return 'bg-green-200 text-green-900';
      case BuyerStatus.CLOSED_LOST:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-b border-gray-200 p-4">
              <div className="flex space-x-4">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (buyers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No buyers found</div>
        <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Name</th>
              <th className="table-header">Contact</th>
              <th className="table-header">Location</th>
              <th className="table-header">Property</th>
              <th className="table-header">Budget Range</th>
              <th className="table-header">Status</th>
              <th className="table-header">Timeline</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {buyers.map((buyer) => (
              <tr key={buyer.id} className="hover:bg-gray-50">
                <td className="table-cell">
                  <div>
                    <div className="font-medium text-gray-900">{buyer.fullName}</div>
                    {buyer.tags && buyer.tags.trim().length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {buyer.tags.split(',').slice(0, 2).map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                        {buyer.tags.split(',').length > 2 && (
                          <span className="text-xs text-gray-500">+{buyer.tags.split(',').length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="table-cell">
                  <div>
                    <div className="text-sm text-gray-900">{buyer.email}</div>
                    <div className="text-sm text-gray-500">{buyer.phone}</div>
                  </div>
                </td>
                <td className="table-cell">
                  <span className="text-sm text-gray-900">{buyer.city}</span>
                </td>
                <td className="table-cell">
                  <div>
                    <div className="text-sm text-gray-900">{buyer.propertyType}</div>
                    <div className="text-sm text-gray-500">{buyer.bhk} BHK • {buyer.purpose}</div>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="text-sm text-gray-900">
                    {formatCurrency(buyer.budgetMin || 0)} - {formatCurrency(buyer.budgetMax || 0)}
                  </div>
                </td>
                <td className="table-cell">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(buyer.status)}`}>
                    {buyer.status}
                  </span>
                </td>
                <td className="table-cell">
                  <span className="text-sm text-gray-900">{buyer.timeline}</span>
                </td>
                <td className="table-cell">
                  <div className="flex space-x-2">
                    <Link
                      href={`/buyers/${buyer.id}`}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      View
                    </Link>
                    <Link
                      href={`/buyers/${buyer.id}/edit`}
                      className="text-green-600 hover:text-green-900 text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  const isCurrentPage = page === currentPage;
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        isCurrentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
