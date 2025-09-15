import { prisma } from '../prisma';

// Use Prisma generated types directly
export type User = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
};

export type Buyer = {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  city: any;
  propertyType: any;
  bhk?: any;
  purpose: any;
  budgetMin?: number;
  budgetMax?: number;
  timeline: any;
  source: any;
  status: any;
  notes?: string;
  tags?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BuyerHistory = {
  id: string;
  buyerId: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: string;
  changedAt: Date;
};

// Input types for create operations
export type BuyerCreateData = {
  fullName: string;
  email?: string;
  phone: string;
  city: any;
  propertyType: any;
  bhk?: any;
  purpose: any;
  budgetMin?: number;
  budgetMax?: number;
  timeline: any;
  source: any;
  status?: any;
  notes?: string;
  tags?: string;
  ownerId: string;
};

export type UserCreateData = {
  email: string;
  name?: string;
};

export type BuyerHistoryCreateData = {
  buyerId: string;
  field: string;
  oldValue?: string;
  newValue?: string;
  changedBy: string;
};

export const db = {
  buyers: {
    findMany: async (): Promise<Buyer[]> => {
      return await prisma.buyer.findMany({
        orderBy: { updatedAt: 'desc' },
      }) as Buyer[];
    },
    
    findById: async (id: string): Promise<Buyer | null> => {
      const buyer = await prisma.buyer.findUnique({
        where: { id },
      });
      return buyer as Buyer | null;
    },
    
    create: async (data: BuyerCreateData): Promise<Buyer> => {
      return await prisma.buyer.create({
        data,
      }) as Buyer;
    },
    
    update: async (id: string, data: Partial<Omit<Buyer, 'id' | 'createdAt' | 'updatedAt' | 'ownerId'>>): Promise<Buyer | null> => {
      try {
        const updated = await prisma.buyer.update({
          where: { id },
          data,
        });
        return updated as Buyer;
      } catch (error) {
        return null;
      }
    },
    
    delete: async (id: string): Promise<boolean> => {
      try {
        await prisma.buyer.delete({
          where: { id },
        });
        return true;
      } catch (error) {
        return false;
      }
    },
  },
  
  users: {
    findMany: async (): Promise<User[]> => {
      return await prisma.user.findMany() as User[];
    },
    
    findByEmail: async (email: string): Promise<User | null> => {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      return user as User | null;
    },
    
    create: async (data: UserCreateData): Promise<User> => {
      return await prisma.user.create({
        data,
      }) as User;
    },
  },
  
  history: {
    findMany: async (): Promise<BuyerHistory[]> => {
      return await prisma.buyerHistory.findMany({
        orderBy: { changedAt: 'desc' },
      }) as BuyerHistory[];
    },
    
    findByBuyerId: async (buyerId: string, limit = 5): Promise<BuyerHistory[]> => {
      return await prisma.buyerHistory.findMany({
        where: { buyerId },
        orderBy: { changedAt: 'desc' },
        take: limit,
      }) as BuyerHistory[];
    },
    
    create: async (data: BuyerHistoryCreateData): Promise<BuyerHistory> => {
      return await prisma.buyerHistory.create({
        data,
      }) as BuyerHistory;
    },
  },
};
