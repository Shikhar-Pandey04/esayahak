import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBuyerById, getBuyerHistory } from '@/lib/db/queries';
import { Navigation } from '@/components/navigation';
import { BuyerDetails } from '@/components/buyer-details';

export default async function BuyerDetailPage({
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
            <p>Please sign in to view buyer details.</p>
          </div>
        </main>
      </div>
    );
  }

  const buyer = await getBuyerById(id);
  
  if (!buyer) {
    notFound();
  }

  const history = await getBuyerHistory(id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <BuyerDetails buyer={buyer as any} history={history as any} currentUserId={(session?.user as any)?.id} />
      </main>
    </div>
  );
}
