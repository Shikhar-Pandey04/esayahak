'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBuyerSchema, type CreateBuyerInput } from '@/lib/validations/buyer';
import { z } from 'zod';

interface BuyerFormProps {
  initialData?: Partial<CreateBuyerInput>;
  isEditing?: boolean;
  buyerId?: string;
  updatedAt?: string;
}

export function BuyerForm({ initialData, isEditing = false, buyerId, updatedAt }: BuyerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateBuyerInput>({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    city: initialData?.city || 'Chandigarh',
    propertyType: initialData?.propertyType || 'Apartment',
    bhk: initialData?.bhk || undefined,
    purpose: initialData?.purpose || 'Buy',
    budgetMin: initialData?.budgetMin || undefined,
    budgetMax: initialData?.budgetMax || undefined,
    timeline: initialData?.timeline || 'Within 3 months',
    source: initialData?.source || 'Website',
    status: initialData?.status || 'New',
    notes: initialData?.notes || '',
    tags: initialData?.tags || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validatedData = createBuyerSchema.parse(formData);
      
      const url = isEditing ? `/api/buyers/${buyerId}` : '/api/buyers';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing ? { ...validatedData, updatedAt } : validatedData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.details) {
          const fieldErrors: Record<string, string> = {};
          error.details.forEach((detail: any) => {
            if (detail.path) {
              fieldErrors[detail.path[0]] = detail.message;
            }
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: error.error || 'Something went wrong' });
        }
        return;
      }

      router.push('/buyers');
      router.refresh();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: 'Something went wrong' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagsChange = (value: string) => {
    setFormData(prev => ({ ...prev, tags: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.general}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              errors.fullName ? 'border-red-300' : ''
            }`}
            required
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            aria-invalid={errors.fullName ? 'true' : 'false'}
          />
          {errors.fullName && (
            <p id="fullName-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.fullName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone *
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City *
          </label>
          <select
            id="city"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value as any }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="Chandigarh">Chandigarh</option>
            <option value="Mohali">Mohali</option>
            <option value="Zirakpur">Zirakpur</option>
            <option value="Panchkula">Panchkula</option>
            <option value="Other">Other</option>
          </select>
          {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
        </div>

        <div>
          <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">
            Property Type *
          </label>
          <select
            id="propertyType"
            value={formData.propertyType}
            onChange={(e) => setFormData(prev => ({ ...prev, propertyType: e.target.value as any }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Plot">Plot</option>
            <option value="Office">Office</option>
            <option value="Retail">Retail</option>
          </select>
          {errors.propertyType && <p className="mt-1 text-sm text-red-600">{errors.propertyType}</p>}
        </div>

        {(['Apartment', 'Villa'].includes(formData.propertyType)) && (
          <div>
            <label htmlFor="bhk" className="block text-sm font-medium text-gray-700">
              BHK *
            </label>
            <select
              id="bhk"
              value={formData.bhk || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, bhk: e.target.value as any }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select BHK</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4 BHK</option>
              <option value="Studio">Studio</option>
            </select>
            {errors.bhk && <p className="mt-1 text-sm text-red-600">{errors.bhk}</p>}
          </div>
        )}

        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
            Purpose *
          </label>
          <select
            id="purpose"
            value={formData.purpose}
            onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value as any }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="Buy">Buy</option>
            <option value="Rent">Rent</option>
          </select>
          {errors.purpose && <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>}
        </div>

        <div>
          <label htmlFor="budgetMin" className="block text-sm font-medium text-gray-700">
            Budget Min (INR)
          </label>
          <input
            type="number"
            id="budgetMin"
            value={formData.budgetMin || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, budgetMin: e.target.value ? parseInt(e.target.value) : undefined }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.budgetMin && <p className="mt-1 text-sm text-red-600">{errors.budgetMin}</p>}
        </div>

        <div>
          <label htmlFor="budgetMax" className="block text-sm font-medium text-gray-700">
            Budget Max (INR)
          </label>
          <input
            type="number"
            id="budgetMax"
            value={formData.budgetMax || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, budgetMax: e.target.value ? parseInt(e.target.value) : undefined }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.budgetMax && <p className="mt-1 text-sm text-red-600">{errors.budgetMax}</p>}
        </div>

        <div>
          <label htmlFor="timeline" className="block text-sm font-medium text-gray-700">
            Timeline *
          </label>
          <select
            id="timeline"
            value={formData.timeline}
            onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value as any }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="0-3m">0-3 months</option>
            <option value="3-6m">3-6 months</option>
            <option value=">6m">&gt;6 months</option>
            <option value="Exploring">Exploring</option>
          </select>
          {errors.timeline && <p className="mt-1 text-sm text-red-600">{errors.timeline}</p>}
        </div>

        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700">
            Source *
          </label>
          <select
            id="source"
            value={formData.source}
            onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value as any }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Walk-in">Walk-in</option>
            <option value="Call">Call</option>
            <option value="Other">Other</option>
          </select>
          {errors.source && <p className="mt-1 text-sm text-red-600">{errors.source}</p>}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status *
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="New">New</option>
            <option value="Qualified">Qualified</option>
            <option value="Contacted">Contacted</option>
            <option value="Visited">Visited</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Converted">Converted</option>
            <option value="Dropped">Dropped</option>
          </select>
          {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          maxLength={1000}
        />
        {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          id="tags"
          value={formData.tags || ''}
          onChange={(e) => handleTagsChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="urgent, premium, referral"
        />
        {errors.tags && <p className="mt-1 text-sm text-red-600">{errors.tags}</p>}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : isEditing ? 'Update Buyer' : 'Create Buyer'}
        </button>
      </div>
    </form>
  );
}
