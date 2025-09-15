import { Readable } from 'stream';
import { csvBuyerSchema, type CsvBuyerInput } from './validations/buyer';
import { z } from 'zod';

export interface CsvValidationError {
  row: number;
  field?: string;
  message: string;
  data: any;
}

export interface CsvImportResult {
  validRows: CsvBuyerInput[];
  errors: CsvValidationError[];
  totalRows: number;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

export async function parseCsvFile(fileContent: string): Promise<CsvImportResult> {
  const lines = fileContent.split('\n').filter(line => line.trim());
  const errors: CsvValidationError[] = [];
  const validRows: CsvBuyerInput[] = [];
  
  if (lines.length === 0) {
    return { validRows: [], errors: [], totalRows: 0 };
  }
  
  // Parse headers
  const headers = parseCsvLine(lines[0]).map(h => h.replace(/"/g, ''));
  const dataLines = lines.slice(1);
  
  dataLines.forEach((line, index) => {
    const rowNumber = index + 2; // +2 because index starts at 0 and we have headers
    
    try {
      const values = parseCsvLine(line);
      const row: any = {};
      
      headers.forEach((header, i) => {
        row[header] = values[i] ? values[i].replace(/"/g, '') : '';
      });
      
      // Clean and transform the row data
      const cleanedRow = {
        fullName: row.fullName?.trim() || '',
        email: row.email?.trim() || '',
        phone: row.phone?.trim() || '',
        city: row.city?.trim() || '',
        propertyType: row.propertyType?.trim() || '',
        bhk: row.bhk?.trim() || '',
        purpose: row.purpose?.trim() || '',
        budgetMin: row.budgetMin?.trim() || '',
        budgetMax: row.budgetMax?.trim() || '',
        timeline: row.timeline?.trim() || '',
        source: row.source?.trim() || '',
        notes: row.notes?.trim() || '',
        tags: row.tags?.trim() || '',
        status: row.status?.trim() || 'New',
      };
      
      const validatedRow = csvBuyerSchema.parse(cleanedRow);
      validRows.push(validatedRow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err: any) => {
          errors.push({
            row: rowNumber,
            field: err.path[0]?.toString(),
            message: err.message,
            data: line,
          });
        });
      } else {
        errors.push({
          row: rowNumber,
          message: 'Unknown validation error',
          data: line,
        });
      }
    }
  });
  
  return {
    validRows,
    errors,
    totalRows: dataLines.length,
  };
}

export function generateCsvContent(buyers: any[]): string {
  const headers = [
    'fullName',
    'email',
    'phone',
    'city',
    'propertyType',
    'bhk',
    'purpose',
    'budgetMin',
    'budgetMax',
    'timeline',
    'source',
    'notes',
    'tags',
    'status'
  ];
  
  const csvRows = [
    headers.join(','),
    ...buyers.map(buyer => {
      const row = [
        `"${buyer.fullName || ''}"`,
        `"${buyer.email || ''}"`,
        `"${buyer.phone || ''}"`,
        `"${buyer.city || ''}"`,
        `"${buyer.propertyType || ''}"`,
        `"${buyer.bhk || ''}"`,
        `"${buyer.purpose || ''}"`,
        buyer.budgetMin || '',
        buyer.budgetMax || '',
        `"${buyer.timeline || ''}"`,
        `"${buyer.source || ''}"`,
        `"${(buyer.notes || '').replace(/"/g, '""')}"`,
        `"${Array.isArray(buyer.tags) ? buyer.tags.join(',') : ''}"`,
        `"${buyer.status || ''}"`
      ];
      return row.join(',');
    })
  ];
  
  return csvRows.join('\n');
}

export const CSV_HEADERS = [
  'fullName',
  'email',
  'phone',
  'city',
  'propertyType',
  'bhk',
  'purpose',
  'budgetMin',
  'budgetMax',
  'timeline',
  'source',
  'notes',
  'tags',
  'status'
];

export const CSV_SAMPLE_DATA = `fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status
John Doe,john@example.com,9876543210,Chandigarh,Apartment,2,Buy,5000000,7000000,0-3m,Website,Looking for 2BHK in Sector 22,urgent,New
Jane Smith,jane@example.com,9876543211,Mohali,Villa,3,Buy,8000000,12000000,3-6m,Referral,Prefers gated community,premium,Qualified`;
