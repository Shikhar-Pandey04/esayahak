'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Buyer {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  city: string;
  propertyType: string;
  bhk?: string;
  purpose: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline: string;
  source: string;
  status: string;
  notes?: string;
  tags?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

interface HistoryEntry {
  id: string;
  changedBy: string;
  changedAt: string;
  diff: Record<string, { old: any; new: any }>;
}

interface BuyerDetailsProps {
  buyer: Buyer;
  history: HistoryEntry[];
  currentUserId: string;
}

export function BuyerDetails({ buyer, history, currentUserId }: BuyerDetailsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const canEdit = buyer.ownerId === currentUserId;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this buyer? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/buyers/${buyer.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete buyer');
      }

      router.push('/buyers');
      router.refresh();
    } catch (error) {
      alert('Failed to delete buyer. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    if (min) return `₹${min.toLocaleString()}+`;
    return `Up to ₹${max?.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFieldName = (field: string) => {
    const fieldNames: Record<string, string> = {
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      city: 'City',
      propertyType: 'Property Type',
      bhk: 'BHK',
      purpose: 'Purpose',
      budgetMin: 'Budget Min',
      budgetMax: 'Budget Max',
      timeline: 'Timeline',
      source: 'Source',
      status: 'Status',
      notes: 'Notes',
      tags: 'Tags',
    };
    return fieldNames[field] || field;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{buyer.fullName}</h1>
              <p className="mt-1 text-sm text-gray-600">
                Created on {formatDate(buyer.createdAt)}
              </p>
            </div>
            <div className="flex space-x-3">
              {canEdit && (
                <>
                  <Link
                    href={`/buyers/${buyer.id}/edit`}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              )}
              <Link
                href="/buyers"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back to List
              </Link>
            </div>
          </div>
        </div>

        {/* Buyer Details */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="text-sm text-gray-900">{buyer.fullName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{buyer.email || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="text-sm text-gray-900">{buyer.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">City</dt>
                  <dd className="text-sm text-gray-900">{buyer.city}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Property Requirements</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Property Type</dt>
                  <dd className="text-sm text-gray-900">{buyer.propertyType}</dd>
                </div>
                {buyer.bhk && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">BHK</dt>
                    <dd className="text-sm text-gray-900">{buyer.bhk}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Purpose</dt>
                  <dd className="text-sm text-gray-900">{buyer.purpose}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Budget</dt>
                  <dd className="text-sm text-gray-900">{formatBudget(buyer.budgetMin, buyer.budgetMax)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Timeline</dt>
                  <dd className="text-sm text-gray-900">{buyer.timeline}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Source</dt>
                  <dd className="text-sm text-gray-900">{buyer.source}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd>
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
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="text-sm text-gray-900">{formatDate(buyer.updatedAt)}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
              <dl className="space-y-3">
                {buyer.tags && buyer.tags.trim().length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Tags</dt>
                    <dd className="text-sm text-gray-900">
                      <div className="flex flex-wrap gap-1 mt-1">
                        {buyer.tags && buyer.tags.split(',').map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </dd>
                  </div>
                )}
                {buyer.notes && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="text-sm text-gray-900 whitespace-pre-wrap">{buyer.notes}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Change History</h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              {history.map((entry) => (
                <div key={entry.id} className="border-l-2 border-gray-200 pl-4">
                  <div className="text-sm text-gray-500 mb-1">
                    {formatDate(entry.changedAt)}
                  </div>
                  <div className="space-y-1">
                    {Object.entries(entry.diff).map(([field, change]) => (
                      <div key={field} className="text-sm">
                        <span className="font-medium text-gray-700">
                          {formatFieldName(field)}:
                        </span>
                        {change.old === null ? (
                          <span className="text-green-600 ml-1">Created</span>
                        ) : (
                          <>
                            <span className="text-red-600 ml-1 line-through">
                              {String(change.old)}
                            </span>
                            <span className="text-green-600 ml-1">
                              → {String(change.new)}
                            </span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
