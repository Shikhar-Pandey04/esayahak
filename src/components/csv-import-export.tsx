'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CSV_SAMPLE_DATA } from '@/lib/csv';

interface ImportError {
  row: number;
  field?: string;
  message: string;
  data: any;
}

interface ImportResult {
  success: boolean;
  totalRows: number;
  validRows: number;
  importedCount: number;
  validationErrors: ImportError[];
  importErrors: ImportError[];
}

export function CsvImportExport() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showSample, setShowSample] = useState(false);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/buyers/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setImportResult(result);

      if (result.success && result.importedCount > 0) {
        router.refresh();
      }
    } catch (error) {
      setImportResult({
        success: false,
        totalRows: 0,
        validRows: 0,
        importedCount: 0,
        validationErrors: [],
        importErrors: [{ row: 0, message: 'Failed to upload file', data: {} }],
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Get current URL search params to maintain filters
      const currentParams = new URLSearchParams(window.location.search);
      const response = await fetch(`/api/buyers/export?${currentParams.toString()}`);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `buyers-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([CSV_SAMPLE_DATA], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'buyers-sample.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">CSV Import/Export</h3>
      
      <div className="space-y-4">
        {/* Import Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Import Buyers</h4>
          <div className="flex items-center space-x-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImport}
              disabled={isImporting}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <button
              onClick={downloadSample}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Download Sample
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Maximum 200 rows per import. CSV must include headers.
          </p>
        </div>

        {/* Export Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Export Buyers</h4>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isExporting ? 'Exporting...' : 'Export Current View'}
          </button>
          <p className="mt-1 text-xs text-gray-500">
            Exports all buyers matching current filters and search.
          </p>
        </div>

        {/* Sample Data Preview */}
        <div>
          <button
            onClick={() => setShowSample(!showSample)}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            {showSample ? 'Hide' : 'Show'} CSV Format Example
          </button>
          {showSample && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md">
              <pre className="text-xs text-gray-700 overflow-x-auto">
                {CSV_SAMPLE_DATA}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Import Results */}
      {importResult && (
        <div className="mt-6 p-4 border rounded-md">
          <h4 className="font-medium mb-2">
            {importResult.success ? 'Import Results' : 'Import Failed'}
          </h4>
          
          <div className="text-sm space-y-1">
            <p>Total rows processed: {importResult.totalRows}</p>
            <p>Valid rows: {importResult.validRows}</p>
            <p className="text-green-600">Successfully imported: {importResult.importedCount}</p>
            
            {importResult.validationErrors.length > 0 && (
              <p className="text-red-600">
                Validation errors: {importResult.validationErrors.length}
              </p>
            )}
            
            {importResult.importErrors.length > 0 && (
              <p className="text-red-600">
                Import errors: {importResult.importErrors.length}
              </p>
            )}
          </div>

          {/* Error Details */}
          {(importResult.validationErrors.length > 0 || importResult.importErrors.length > 0) && (
            <div className="mt-4">
              <h5 className="font-medium text-red-700 mb-2">Errors:</h5>
              <div className="max-h-40 overflow-y-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-2 py-1 text-left">Row</th>
                      <th className="px-2 py-1 text-left">Field</th>
                      <th className="px-2 py-1 text-left">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...importResult.validationErrors, ...importResult.importErrors].map((error, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-2 py-1">{error.row}</td>
                        <td className="px-2 py-1">{error.field || '-'}</td>
                        <td className="px-2 py-1">{error.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
