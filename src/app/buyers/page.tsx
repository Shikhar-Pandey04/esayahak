import { Suspense } from 'react';
import { Navigation } from '@/components/navigation';
import { BuyersList } from '@/components/buyers-list';

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

export default async function BuyersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Buyer Leads</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and track all your buyer leads
            </p>
          </div>
          <Suspense fallback={<div className="p-6">Loading...</div>}>
            <BuyersList searchParams={resolvedSearchParams} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
