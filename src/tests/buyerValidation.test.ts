import { describe, it, expect } from '@jest/globals';
import { 
  buyerCreateSchema, 
  buyerUpdateSchema, 
  buyerFilterSchema,
  csvBuyerSchema 
} from '../lib/validations/buyer';
import { City, PropertyType, Purpose, BuyerStatus, Timeline } from '../lib/validations/buyer';

describe('Buyer Validation Schemas', () => {
  describe('buyerCreateSchema', () => {
    it('should validate a complete buyer object', () => {
      const validBuyer = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+91-9876543210',
        city: City.MUMBAI,
        propertyType: PropertyType.APARTMENT,
        bhk: 2,
        purpose: Purpose.BUY,
        budgetMin: 5000000,
        budgetMax: 8000000,
        timeline: Timeline.WITHIN_3_MONTHS,
        source: 'Website',
        status: BuyerStatus.NEW,
        notes: 'Looking for a 2BHK apartment in Mumbai',
        tags: ['urgent', 'first-time-buyer']
      };

      const result = buyerCreateSchema.safeParse(validBuyer);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidBuyer = {
        fullName: 'John Doe',
        email: 'invalid-email',
        phone: '+91-9876543210',
        city: City.MUMBAI,
        propertyType: PropertyType.APARTMENT,
        bhk: 2,
        purpose: Purpose.BUY,
        budgetMin: 5000000,
        budgetMax: 8000000,
        timeline: Timeline.WITHIN_3_MONTHS,
        source: 'Website',
        status: BuyerStatus.NEW
      };

      const result = buyerCreateSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
    });

    it('should reject invalid phone format', () => {
      const invalidBuyer = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '123',
        city: City.MUMBAI,
        propertyType: PropertyType.APARTMENT,
        bhk: 2,
        purpose: Purpose.BUY,
        budgetMin: 5000000,
        budgetMax: 8000000,
        timeline: Timeline.WITHIN_3_MONTHS,
        source: 'Website',
        status: BuyerStatus.NEW
      };

      const result = buyerCreateSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
    });

    it('should reject invalid budget range (min > max)', () => {
      const invalidBuyer = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+91-9876543210',
        city: City.MUMBAI,
        propertyType: PropertyType.APARTMENT,
        bhk: 2,
        purpose: Purpose.BUY,
        budgetMin: 8000000,
        budgetMax: 5000000,
        timeline: Timeline.WITHIN_3_MONTHS,
        source: 'Website',
        status: BuyerStatus.NEW
      };

      const result = buyerCreateSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
    });
  });

  describe('buyerUpdateSchema', () => {
    it('should allow partial updates', () => {
      const partialUpdate = {
        status: BuyerStatus.CONTACTED,
        notes: 'Updated notes'
      };

      const result = buyerUpdateSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should validate budget range in partial updates', () => {
      const invalidUpdate = {
        budgetMin: 8000000,
        budgetMax: 5000000
      };

      const result = buyerUpdateSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });

  describe('csvBuyerSchema', () => {
    it('should validate CSV row data', () => {
      const csvRow = {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+91-9876543211',
        city: 'Delhi',
        propertyType: 'Villa',
        bhk: '3',
        purpose: 'Rent',
        budgetMin: '10000',
        budgetMax: '15000',
        timeline: 'Within 6 months',
        source: 'Referral',
        status: 'New',
        notes: 'Looking for villa in Delhi',
        tags: 'luxury,spacious'
      };

      const result = csvBuyerSchema.safeParse(csvRow);
      expect(result.success).toBe(true);
    });

    it('should handle string numbers in CSV', () => {
      const csvRow = {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '+91-9876543212',
        city: 'Bangalore',
        propertyType: 'Apartment',
        bhk: '2',
        purpose: 'Buy',
        budgetMin: '5000000',
        budgetMax: '7000000',
        timeline: 'Within 3 months',
        source: 'Website',
        status: 'New'
      };

      const result = csvBuyerSchema.safeParse(csvRow);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.bhk).toBe('number');
        expect(typeof result.data.budgetMin).toBe('number');
        expect(typeof result.data.budgetMax).toBe('number');
      }
    });
  });

  describe('buyerFilterSchema', () => {
    it('should validate filter parameters', () => {
      const filters = {
        city: City.MUMBAI,
        propertyType: PropertyType.APARTMENT,
        status: BuyerStatus.NEW,
        budgetMin: 5000000,
        budgetMax: 10000000,
        search: 'john',
        page: 1,
        limit: 10
      };

      const result = buyerFilterSchema.safeParse(filters);
      expect(result.success).toBe(true);
    });

    it('should handle empty filter object', () => {
      const result = buyerFilterSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate pagination parameters', () => {
      const filters = {
        page: 0, // Invalid page
        limit: 101 // Invalid limit (too high)
      };

      const result = buyerFilterSchema.safeParse(filters);
      expect(result.success).toBe(false);
    });
  });
});
