import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createBuyer } from '@/lib/db/queries';
import { parseCsvFile } from '@/lib/csv';
import { rateLimit, getClientIdentifier, rateLimitConfigs } from '@/lib/rate-limit';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Apply CSV import rate limiting
    const identifier = getClientIdentifier(request);
    const limiter = rateLimit(rateLimitConfigs.csvImport);
    const rateLimitResult = await limiter(request, identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          }
        }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 });
    }

    const fileContent = await file.text();
    const { validRows, errors, totalRows } = await parseCsvFile(fileContent);

    if (validRows.length > 200) {
      return NextResponse.json({ 
        error: 'Too many rows. Maximum 200 rows allowed per import.' 
      }, { status: 400 });
    }

    // Import valid rows in a transaction-like manner
    const importedBuyers = [];
    const importErrors = [];

    for (let i = 0; i < validRows.length; i++) {
      try {
        const buyerData = {
          ...validRows[i],
          email: validRows[i].email || undefined,
          tags: validRows[i].tags || undefined,
          bhk: validRows[i].bhk === "" ? undefined : Number(validRows[i].bhk),
          budgetMin: validRows[i].budgetMin || undefined,
          budgetMax: validRows[i].budgetMax || undefined,
          notes: validRows[i].notes || undefined
        };
        const buyer = await createBuyer(buyerData, (session.user as any).id);
        importedBuyers.push(buyer);
      } catch (error) {
        importErrors.push({
          row: i + 2, // +2 for header and 0-based index
          message: error instanceof Error ? error.message : 'Failed to create buyer',
          data: validRows[i],
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalRows,
      validRows: validRows.length,
      importedCount: importedBuyers.length,
      validationErrors: errors,
      importErrors,
    });

  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json({ 
      error: 'Failed to process CSV file' 
    }, { status: 500 });
  }
}
