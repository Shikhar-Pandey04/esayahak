import Link from 'next/link';
import { Navigation } from '@/components/navigation';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Buyer Lead Intake System
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Manage property buyer leads efficiently with our comprehensive CRM
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              href="/buyers"
              className="bg-indigo-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              View All Buyers
            </Link>
            <Link
              href="/buyers/new"
              className="bg-white text-indigo-600 border border-indigo-600 px-6 py-3 rounded-md text-lg font-medium hover:bg-indigo-50 transition-colors"
            >
              Add New Buyer
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Lead Management
            </h3>
            <p className="text-gray-600">
              Capture and organize buyer information with comprehensive forms and validation
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Search & Filter
            </h3>
            <p className="text-gray-600">
              Find leads quickly with advanced search and filtering capabilities
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              CSV Import/Export
            </h3>
            <p className="text-gray-600">
              Bulk import leads and export data for external analysis
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
