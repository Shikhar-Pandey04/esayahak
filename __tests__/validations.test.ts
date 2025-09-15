import { 
  buyerSchema, 
  createBuyerSchema, 
  updateBuyerSchema,
  csvBuyerSchema,
  buyerFilterSchema 
} from '../src/lib/validations/buyer';

describe('Buyer Validations', () => {
  describe('createBuyerSchema', () => {
    it('should validate a complete buyer object', () => {
      const validBuyer = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: '2',
        purpose: 'Buy',
        budgetMin: 5000000,
        budgetMax: 7000000,
        timeline: '3-6m',
        source: 'Website',
        status: 'New',
        notes: 'Looking for a 2BHK apartment',
        tags: ['urgent', 'first-time-buyer']
      };

      const result = createBuyerSchema.safeParse(validBuyer);
      expect(result.success).toBe(true);
    });

    it('should require BHK for Apartment and Villa', () => {
      const buyerWithoutBhk = {
        fullName: 'John Doe',
        phone: '1234567890',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        purpose: 'Buy',
        timeline: '3-6m',
        source: 'Website'
      };

      const result = createBuyerSchema.safeParse(buyerWithoutBhk);
      expect(result.success).toBe(false);
    });

    it('should validate budget range', () => {
      const invalidBudget = {
        fullName: 'John Doe',
        phone: '1234567890',
        city: 'Chandigarh',
        propertyType: 'Plot',
        purpose: 'Buy',
        budgetMin: 7000000,
        budgetMax: 5000000, // Max less than min
        timeline: '3-6m',
        source: 'Website'
      };

      const result = createBuyerSchema.safeParse(invalidBudget);
      expect(result.success).toBe(false);
    });

    it('should validate phone number format', () => {
      const invalidPhone = {
        fullName: 'John Doe',
        phone: '123', // Too short
        city: 'Chandigarh',
        propertyType: 'Plot',
        purpose: 'Buy',
        timeline: '3-6m',
        source: 'Website'
      };

      const result = createBuyerSchema.safeParse(invalidPhone);
      expect(result.success).toBe(false);
    });
  });

  describe('updateBuyerSchema', () => {
    it('should allow partial updates', () => {
      const partialUpdate = {
        fullName: 'Jane Doe',
        status: 'Contacted'
      };

      const result = updateBuyerSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should validate BHK requirement when propertyType is updated', () => {
      const updateWithoutBhk = {
        propertyType: 'Villa'
        // Missing BHK
      };

      const result = updateBuyerSchema.safeParse(updateWithoutBhk);
      expect(result.success).toBe(false);
    });
  });

  describe('csvBuyerSchema', () => {
    it('should parse CSV string values correctly', () => {
      const csvData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        city: 'Chandigarh',
        propertyType: 'Plot',
        purpose: 'Buy',
        budgetMin: '5000000', // String values from CSV
        budgetMax: '7000000',
        timeline: '3-6m',
        source: 'Website',
        notes: 'Test notes',
        tags: 'urgent,first-time', // Comma-separated string
        status: 'New'
      };

      const result = csvBuyerSchema.safeParse(csvData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.budgetMin).toBe(5000000);
        expect(result.data.budgetMax).toBe(7000000);
        expect(result.data.tags).toEqual(['urgent', 'first-time']);
      }
    });
  });

  describe('buyerFilterSchema', () => {
    it('should validate filter parameters', () => {
      const filters = {
        search: 'John',
        city: 'Chandigarh',
        status: 'New',
        page: 1,
        limit: 10,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      };

      const result = buyerFilterSchema.safeParse(filters);
      expect(result.success).toBe(true);
    });

    it('should apply default values', () => {
      const minimalFilters = {};

      const result = buyerFilterSchema.safeParse(minimalFilters);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
        expect(result.data.sortBy).toBe('updatedAt');
        expect(result.data.sortOrder).toBe('desc');
      }
    });

    it('should limit maximum page size', () => {
      const largeLimit = {
        limit: 100 // Over the 50 limit
      };

      const result = buyerFilterSchema.safeParse(largeLimit);
      expect(result.success).toBe(false);
    });
  });
});
