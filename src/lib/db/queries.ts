import { db, type Buyer, type BuyerHistory } from './index';
import type { BuyerFilter } from '../validations/buyer';

export async function createBuyer(data: Omit<Buyer, 'id' | 'createdAt' | 'updatedAt' | 'ownerId'>, userId: string) {
  const buyer = await db.buyers.create({
    ...data,
    ownerId: userId,
  });

  // Create history entry
  await db.history.create({
    buyerId: buyer.id,
    field: 'created',
    oldValue: undefined,
    newValue: 'Created buyer record',
    changedBy: userId,
  });

  return buyer;
}

export async function getBuyers(filters: BuyerFilter) {
  const { search, city, propertyType, status, timeline, page, limit, sortBy, sortOrder } = filters;
  
  let buyers = await db.buyers.findMany();
  
  // Apply filters
  if (search) {
    const searchLower = search.toLowerCase();
    buyers = buyers.filter((buyer: Buyer) => 
      buyer.fullName.toLowerCase().includes(searchLower) ||
      buyer.email?.toLowerCase().includes(searchLower) ||
      buyer.phone.includes(search)
    );
  }

  if (city) {
    buyers = buyers.filter((buyer: Buyer) => buyer.city === city);
  }

  if (propertyType) {
    buyers = buyers.filter((buyer: Buyer) => buyer.propertyType === propertyType);
  }

  if (status) {
    buyers = buyers.filter((buyer: Buyer) => buyer.status === status);
  }

  if (timeline) {
    buyers = buyers.filter((buyer: Buyer) => buyer.timeline === timeline);
  }

  // Sort
  buyers.sort((a: Buyer, b: Buyer) => {
    const aValue = a[sortBy as keyof Buyer] || '';
    const bValue = b[sortBy as keyof Buyer] || '';
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const offset = (page - 1) * limit;
  const totalCount = buyers.length;
  const totalPages = Math.ceil(totalCount / limit);
  
  // Get paginated results
  const paginatedBuyers = buyers.slice(offset, offset + limit);

  return {
    buyers: paginatedBuyers,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
    },
  };
}

export async function getBuyerById(id: string) {
  return db.buyers.findById(id);
}

export async function updateBuyer(
  id: string, 
  data: Partial<Omit<Buyer, 'id' | 'createdAt' | 'updatedAt' | 'ownerId'>>, 
  userId: string,
  currentUpdatedAt: Date
) {
  // Check if record was modified since last read
  const currentBuyer = await db.buyers.findById(id);
  if (!currentBuyer) {
    throw new Error('Buyer not found');
  }
  
  if (currentBuyer.updatedAt.getTime() !== currentUpdatedAt.getTime()) {
    throw new Error('Record has been modified by another user. Please refresh and try again.');
  }
  
  // Calculate diff for history
  Object.entries(data).forEach(([key, newValue]) => {
    const oldValue = currentBuyer[key as keyof Buyer];
    if (oldValue !== newValue) {
      // Create individual history entries for each changed field
      db.history.create({
        buyerId: id,
        field: key,
        oldValue: String(oldValue || ''),
        newValue: String(newValue || ''),
        changedBy: userId,
      });
    }
  });
  
  // Update buyer
  const updatedBuyer = await db.buyers.update(id, data);
  
  return updatedBuyer;
}

export async function deleteBuyer(id: string) {
  return db.buyers.delete(id);
}

export async function getBuyerHistory(buyerId: string, limit = 5) {
  return db.history.findByBuyerId(buyerId, limit);
}

export async function canUserEditBuyer(buyerId: string, userId: string): Promise<boolean> {
  const buyer = await db.buyers.findById(buyerId);
  return buyer?.ownerId === userId;
}
