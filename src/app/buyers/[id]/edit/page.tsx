import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBuyerById, canUserEditBuyer } from '@/lib/db/queries';
import { Navigation } from '@/components/navigation';
import { BuyerForm } from '@/components/buyer-form';

export default async function EditBuyerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!(session?.user as any)?.id) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p>Please sign in to edit buyers.</p>
          </div>
        </main>
      </div>
    );
  }

  const buyer = await getBuyerById(id);
  
  if (!buyer) {
    notFound();
  }

  const canEdit = await canUserEditBuyer(id, (session?.user as any)?.id);
  
  if (!canEdit) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p>You can only edit buyers that you created.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Edit Buyer</h1>
            <p className="mt-1 text-sm text-gray-600">
              Update buyer information and requirements
            </p>
          </div>
          <div className="px-6 py-6">
            <BuyerForm
              initialData={buyer as any}
              isEditing={true}
              buyerId={buyer.id}
              updatedAt={buyer.updatedAt.toISOString()}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
