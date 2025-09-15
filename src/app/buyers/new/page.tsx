import { Navigation } from '@/components/navigation';
import { BuyerForm } from '@/components/buyer-form';
import { BuyerFormErrorBoundary } from '@/components/error-boundary';

export default function NewBuyerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Add New Buyer</h1>
            <p className="mt-1 text-sm text-gray-600">
              Create a new buyer lead with all the necessary information.
            </p>
          </div>
          <div className="px-6 py-6">
            <BuyerFormErrorBoundary>
              <BuyerForm />
            </BuyerFormErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  );
}
