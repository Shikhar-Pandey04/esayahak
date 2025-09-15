import { parseCsvFile, generateCsvContent } from '../src/lib/csv';

// Mock test framework functions
const testSuite = (name: string, fn: () => void) => {
  console.log(`\n--- ${name} ---`);
  fn();
};

const it = (name: string, fn: () => void | Promise<void>) => {
  try {
    const result = fn();
    if (result instanceof Promise) {
      result.then(() => console.log(`✓ ${name}`)).catch(error => console.log(`✗ ${name}: ${error}`));
    } else {
      console.log(`✓ ${name}`);
    }
  } catch (error) {
    console.log(`✗ ${name}: ${error}`);
  }
};

const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) {
      throw new Error(`Expected ${expected}, got ${actual}`);
    }
  },
  toHaveLength: (expected: number) => {
    if (actual.length !== expected) {
      throw new Error(`Expected length ${expected}, got ${actual.length}`);
    }
  },
  toBeGreaterThan: (expected: number) => {
    if (actual <= expected) {
      throw new Error(`Expected ${actual} to be greater than ${expected}`);
    }
  },
  toContain: (expected: string) => {
    if (!actual.includes(expected)) {
      throw new Error(`Expected "${actual}" to contain "${expected}"`);
    }
  }
});

// Add parseCsvString function that's missing
function parseCsvString(csvContent: string) {
  return parseCsvFile(csvContent);
}

testSuite('CSV Functions', () => {
  testSuite('parseCsvFile', () => {
    it('should parse valid CSV content', async () => {
      const csvContent = `fullName,email,phone,city,propertyType,purpose,timeline,source
John Doe,john@example.com,1234567890,Chandigarh,Plot,Buy,3-6m,Website
Jane Smith,jane@example.com,9876543210,Mohali,Apartment,Rent,0-3m,Referral`;

      const result = await parseCsvFile(csvContent);

      expect(result.totalRows).toBe(2);
      expect(result.validRows).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.validRows[0].fullName).toBe('John Doe');
      expect(result.validRows[1].fullName).toBe('Jane Smith');
    });

    it('should handle CSV with validation errors', async () => {
      const csvContent = `fullName,email,phone,city,propertyType,purpose,timeline,source
,invalid-email,123,InvalidCity,InvalidType,InvalidPurpose,InvalidTimeline,InvalidSource`;

      const result = await parseCsvFile(csvContent);

      expect(result.totalRows).toBe(1);
      expect(result.validRows).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle empty CSV', async () => {
      const csvContent = `fullName,email,phone,city,propertyType,purpose,timeline,source`;

      const result = await parseCsvFile(csvContent);

      expect(result.totalRows).toBe(0);
      expect(result.validRows).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  testSuite('parseCsvString', () => {
    it('should parse valid CSV content', async () => {
      const csvContent = `fullName,email,phone,city,propertyType,purpose,timeline,source
John Doe,john@example.com,1234567890,Chandigarh,Plot,Buy,3-6m,Website
Jane Smith,jane@example.com,9876543210,Mohali,Apartment,Rent,0-3m,Referral`;

      const result = await parseCsvString(csvContent);

      expect(result.totalRows).toBe(2);
      expect(result.validRows).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.validRows[0].fullName).toBe('John Doe');
      expect(result.validRows[1].fullName).toBe('Jane Smith');
    });

    it('should handle CSV with validation errors', async () => {
      const csvContent = `fullName,email,phone,city,propertyType,purpose,timeline,source
,invalid-email,123,InvalidCity,InvalidType,InvalidPurpose,InvalidTimeline,InvalidSource`;

      const result = await parseCsvFile(csvContent);

      expect(result.totalRows).toBe(1);
      expect(result.validRows).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle empty CSV', async () => {
      const csvContent = `fullName,email,phone,city,propertyType,purpose,timeline,source`;

      const result = await parseCsvFile(csvContent);

      expect(result.totalRows).toBe(0);
      expect(result.validRows).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  testSuite('generateCsvContent', () => {
    it('should generate CSV from buyer data', () => {
      const buyers = [
        {
          id: '1',
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          city: 'Chandigarh',
          propertyType: 'Plot',
          bhk: null,
          purpose: 'Buy',
          budgetMin: 5000000,
          budgetMax: 7000000,
          timeline: '3-6m',
          source: 'Website',
          status: 'New',
          notes: 'Test notes',
          tags: ['urgent'],
          ownerId: 'user1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ];

      const csv = generateCsvContent(buyers);
      
      expect(csv).toContain('fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status');
      expect(csv).toContain('"John Doe","john@example.com","1234567890","Chandigarh","Plot","","Buy",5000000,7000000,"3-6m","Website","Test notes","urgent","New"');
    });

    it('should handle empty buyer array', () => {
      const csv = generateCsvContent([]);
      expect(csv).toContain('fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status');
    });

    it('should escape CSV special characters', () => {
      const buyers = [
        {
          id: '1',
          fullName: 'John "Johnny" Doe',
          email: 'john@example.com',
          phone: '1234567890',
          city: 'Chandigarh',
          propertyType: 'Plot',
          bhk: null,
          purpose: 'Buy',
          budgetMin: null,
          budgetMax: null,
          timeline: '3-6m',
          source: 'Website',
          status: 'New',
          notes: 'Notes with, comma and "quotes"',
          tags: ['tag1', 'tag2'],
          ownerId: 'user1',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const csv = generateCsvContent(buyers);
      expect(csv).toContain('"John "Johnny" Doe"');
      expect(csv).toContain('"Notes with, comma and ""quotes"""');
    });
  });
});
