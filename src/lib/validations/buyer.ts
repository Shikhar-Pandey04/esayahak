import { z } from 'zod';

// Enums
export const cityEnum = z.enum(['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']);
export const propertyTypeEnum = z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']);
export const bhkEnum = z.union([z.coerce.number().int().min(1).max(10), z.literal('Studio')]);
export const purposeEnum = z.enum(['Buy', 'Rent']);
export const timelineEnum = z.enum(['Within 3 months', 'Within 6 months', 'After 6 months', 'Exploring']);
export const sourceEnum = z.enum(['Website', 'Referral', 'Walk-in', 'Call', 'Other']);
export const statusEnum = z.enum(['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost']);

// Base buyer schema
export const buyerSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name must not exceed 80 characters'),
  email: z.string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .regex(/^\d{10,15}$/, 'Phone must be 10-15 digits'),
  city: cityEnum,
  propertyType: propertyTypeEnum,
  bhk: bhkEnum.optional(),
  purpose: purposeEnum,
  budgetMin: z.number()
    .int()
    .positive('Budget minimum must be positive')
    .optional(),
  budgetMax: z.number()
    .int()
    .positive('Budget maximum must be positive')
    .optional(),
  timeline: timelineEnum,
  source: sourceEnum,
  status: statusEnum.default('New'),
  notes: z.string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional(),
  tags: z.string().optional(),
}).refine((data) => {
  // BHK is required for Apartment and Villa
  if (['Apartment', 'Villa'].includes(data.propertyType) && (!data.bhk || (typeof data.bhk === 'number' && data.bhk < 1))) {
    return false;
  }
  return true;
}, {
  message: 'BHK is required for Apartment and Villa property types',
  path: ['bhk'],
}).refine((data) => {
  // Budget max must be >= budget min when both are present
  if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
    return false;
  }
  return true;
}, {
  message: 'Budget maximum must be greater than or equal to budget minimum',
  path: ['budgetMax'],
});

// Create buyer schema (without id, timestamps, ownerId)
export const createBuyerSchema = buyerSchema;

// Update buyer schema (partial, but still with validation)
export const updateBuyerSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name must not exceed 80 characters')
    .optional(),
  email: z.string()
    .email('Invalid email format')
    .optional(),
  phone: z.string()
    .regex(/^\d{10,15}$/, 'Phone must be 10-15 digits')
    .optional(),
  city: cityEnum.optional(),
  propertyType: propertyTypeEnum.optional(),
  bhk: bhkEnum.optional(),
  purpose: purposeEnum.optional(),
  budgetMin: z.number()
    .int()
    .positive('Budget minimum must be positive')
    .optional(),
  budgetMax: z.number()
    .int()
    .positive('Budget maximum must be positive')
    .optional(),
  timeline: timelineEnum.optional(),
  source: sourceEnum.optional(),
  status: statusEnum.optional(),
  notes: z.string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional(),
  tags: z.string().optional(),
}).refine((data) => {
  // If propertyType is being updated, check BHK requirement
  if (data.propertyType && ['Apartment', 'Villa'].includes(data.propertyType) && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: 'BHK is required for Apartment and Villa property types',
  path: ['bhk'],
}).refine((data) => {
  // Budget validation when both are present
  if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
    return false;
  }
  return true;
}, {
  message: 'Budget maximum must be greater than or equal to budget minimum',
  path: ['budgetMax'],
});

// CSV import schema (includes status field)
export const csvBuyerSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().regex(/^\d{10,15}$/),
  city: cityEnum,
  propertyType: propertyTypeEnum,
  bhk: bhkEnum.optional().or(z.literal('')),
  purpose: purposeEnum,
  budgetMin: z.string().transform((val) => val ? parseInt(val) : undefined).optional(),
  budgetMax: z.string().transform((val) => val ? parseInt(val) : undefined).optional(),
  timeline: timelineEnum,
  source: sourceEnum,
  notes: z.string().max(1000).optional().or(z.literal('')),
  tags: z.string().optional(),
  status: statusEnum.default('New'),
}).refine((data) => {
  if (['Apartment', 'Villa'].includes(data.propertyType) && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: 'BHK is required for Apartment and Villa property types',
  path: ['bhk'],
}).refine((data) => {
  if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
    return false;
  }
  return true;
}, {
  message: 'Budget maximum must be greater than or equal to budget minimum',
  path: ['budgetMax'],
});

// Search/filter schema
export const buyerFilterSchema = z.object({
  search: z.string().optional(),
  city: cityEnum.optional(),
  propertyType: propertyTypeEnum.optional(),
  status: statusEnum.optional(),
  timeline: timelineEnum.optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(10),
  sortBy: z.enum(['fullName', 'phone', 'city', 'propertyType', 'status', 'updatedAt']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Export enum values as constants for easier usage
export const City = {
  MUMBAI: 'Mumbai' as const,
  DELHI: 'Delhi' as const,
  BANGALORE: 'Bangalore' as const,
  CHENNAI: 'Chennai' as const,
  HYDERABAD: 'Hyderabad' as const,
  PUNE: 'Pune' as const,
  KOLKATA: 'Kolkata' as const,
  AHMEDABAD: 'Ahmedabad' as const,
  CHANDIGARH: 'Chandigarh' as const,
  MOHALI: 'Mohali' as const,
  ZIRAKPUR: 'Zirakpur' as const,
  PANCHKULA: 'Panchkula' as const,
  OTHER: 'Other' as const,
} as const;

export const PropertyType = {
  APARTMENT: 'Apartment' as const,
  VILLA: 'Villa' as const,
  PLOT: 'Plot' as const,
  OFFICE: 'Office' as const,
  RETAIL: 'Retail' as const,
} as const;

export const Purpose = {
  BUY: 'Buy' as const,
  RENT: 'Rent' as const,
} as const;

export const Timeline = {
  WITHIN_3_MONTHS: 'Within 3 months' as const,
  WITHIN_6_MONTHS: 'Within 6 months' as const,
  AFTER_6_MONTHS: 'After 6 months' as const,
  EXPLORING: 'Exploring' as const,
} as const;

export const BuyerStatus = {
  NEW: 'New' as const,
  CONTACTED: 'Contacted' as const,
  QUALIFIED: 'Qualified' as const,
  PROPOSAL_SENT: 'Proposal Sent' as const,
  NEGOTIATION: 'Negotiation' as const,
  CLOSED_WON: 'Closed Won' as const,
  CLOSED_LOST: 'Closed Lost' as const,
} as const;

// Export schemas with expected names
export const buyerCreateSchema = createBuyerSchema;
export const buyerUpdateSchema = updateBuyerSchema;

// Type exports
export type BuyerInput = z.infer<typeof buyerSchema>;
export type CreateBuyerInput = z.infer<typeof createBuyerSchema>;
export type UpdateBuyerInput = z.infer<typeof updateBuyerSchema>;
export type CsvBuyerInput = z.infer<typeof csvBuyerSchema>;
export type BuyerFilter = z.infer<typeof buyerFilterSchema>;
