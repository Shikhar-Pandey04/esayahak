import { db, type Buyer, type BuyerHistory } from './index';
import type { BuyerFilter } from '../validations/buyer';

export async function createBuyer(data: Omit<Buyer, 'id' | 'createdAt' | 'updatedAt' | 'ownerId'>, userId: string) {
  // Map form values to Prisma enum constants
  const cityMap: Record<string, string> = {
    'Mumbai': 'MUMBAI',
    'Delhi': 'DELHI', 
    'Bangalore': 'BANGALORE',
    'Chennai': 'CHENNAI',
    'Hyderabad': 'HYDERABAD',
    'Pune': 'PUNE',
    'Kolkata': 'KOLKATA',
    'Ahmedabad': 'AHMEDABAD',
    'Chandigarh': 'CHANDIGARH',
    'Mohali': 'MOHALI',
    'Zirakpur': 'ZIRAKPUR',
    'Panchkula': 'PANCHKULA',
    'Other': 'OTHER'
  };

  const propertyTypeMap: Record<string, string> = {
    'Apartment': 'APARTMENT',
    'Villa': 'VILLA',
    'Plot': 'PLOT',
    'Office': 'OFFICE',
    'Retail': 'RETAIL'
  };

  const bhkMap: Record<string | number, string> = {
    1: 'ONE', 2: 'TWO', 3: 'THREE', 4: 'FOUR', 5: 'FIVE',
    6: 'SIX', 7: 'SEVEN', 8: 'EIGHT', 9: 'NINE', 10: 'TEN'
  };

  const purposeMap: Record<string, string> = {
    'Buy': 'BUY',
    'Rent': 'RENT'
  };

  const timelineMap: Record<string, string> = {
    'Within 3 months': 'WITHIN_3_MONTHS',
    'Within 6 months': 'WITHIN_6_MONTHS', 
    'After 6 months': 'AFTER_6_MONTHS',
    'Exploring': 'EXPLORING'
  };

  const sourceMap: Record<string, string> = {
    'Website': 'WEBSITE',
    'Referral': 'REFERRAL',
    'Walk-in': 'WALK_IN',
    'Call': 'CALL',
    'Other': 'OTHER'
  };

  const statusMap: Record<string, string> = {
    'New': 'NEW',
    'Contacted': 'CONTACTED',
    'Qualified': 'QUALIFIED',
    'Proposal Sent': 'PROPOSAL_SENT',
    'Negotiation': 'NEGOTIATION',
    'Closed Won': 'CLOSED_WON',
    'Closed Lost': 'CLOSED_LOST'
  };

  const buyer = await db.buyers.create({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    city: cityMap[data.city as string] as any,
    propertyType: propertyTypeMap[data.propertyType as string] as any,
    bhk: data.bhk ? bhkMap[data.bhk] as any : undefined,
    purpose: purposeMap[data.purpose as string] as any,
    budgetMin: data.budgetMin,
    budgetMax: data.budgetMax,
    timeline: timelineMap[data.timeline as string] as any,
    source: sourceMap[data.source as string] as any,
    status: statusMap[data.status as string || 'New'] as any,
    notes: data.notes,
    tags: data.tags,
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
