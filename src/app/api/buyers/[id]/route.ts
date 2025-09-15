import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBuyerById, updateBuyer, deleteBuyer, canUserEditBuyer, getBuyerHistory } from '@/lib/db/queries';
import { updateBuyerSchema } from '@/lib/validations/buyer';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const buyer = await getBuyerById(id);
    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Get history for this buyer
    const history = await getBuyerHistory(id);

    return NextResponse.json({ buyer, history });
  } catch (error) {
    console.error('Error fetching buyer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    // Check if user can edit this buyer
    const canEdit = await canUserEditBuyer(id, (session.user as any).id);
    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden: You can only edit your own buyers' }, { status: 403 });
    }

    const body = await request.json();
    const { updatedAt, ...data } = body;
    
    if (!updatedAt) {
      return NextResponse.json({ error: 'updatedAt is required for concurrency control' }, { status: 400 });
    }

    const validatedData = updateBuyerSchema.parse(data);
    const currentUpdatedAt = new Date(updatedAt);

    const buyer = await updateBuyer(id, validatedData, (session.user as any).id, currentUpdatedAt);

    return NextResponse.json(buyer);
  } catch (error) {
    console.error('Error updating buyer:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes('modified by another user')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    // Check if user can delete this buyer
    const canEdit = await canUserEditBuyer(id, (session.user as any).id);
    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own buyers' }, { status: 403 });
    }

    await deleteBuyer(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting buyer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
