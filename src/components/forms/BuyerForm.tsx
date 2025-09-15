import React from 'react';
import { Buyer } from '@/lib/db';
import { buyerCreateSchema, buyerUpdateSchema } from '@/lib/validations/buyer';
import { City, PropertyType, Purpose, BuyerStatus, Timeline } from '@/lib/validations/buyer';

interface BuyerFormProps {
  buyer?: Partial<Buyer>;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export function BuyerForm({ buyer, onSubmit, isLoading = false, mode }: BuyerFormProps) {
  const [formData, setFormData] = React.useState({
    fullName: buyer?.fullName || '',
    email: buyer?.email || '',
    phone: buyer?.phone || '',
    city: buyer?.city || City.MUMBAI,
    propertyType: buyer?.propertyType || PropertyType.APARTMENT,
    bhk: buyer?.bhk || 1,
    purpose: buyer?.purpose || Purpose.BUY,
    budgetMin: buyer?.budgetMin || 0,
    budgetMax: buyer?.budgetMax || 0,
    timeline: buyer?.timeline || Timeline.WITHIN_3_MONTHS,
    source: buyer?.source || '',
    status: buyer?.status || BuyerStatus.NEW,
    notes: buyer?.notes || '',
    tags: buyer?.tags || ''
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      tags: formData.tags
    };

    const schema = mode === 'create' ? buyerCreateSchema : buyerUpdateSchema;
    const result = schema.safeParse(submitData);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((error: any) => {
        if (error.path[0]) {
          newErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});
    await onSubmit(result.data);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className="form-input"
            required
          />
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label className="form-label">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="form-input"
            required
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="form-label">Phone *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="form-input"
            placeholder="+91-9876543210"
            required
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="form-label">City *</label>
          <select
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="form-input"
            required
          >
            {Object.values(City).map((city: string) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="form-label">Property Type *</label>
          <select
            value={formData.propertyType}
            onChange={(e) => handleChange('propertyType', e.target.value)}
            className="form-input"
            required
          >
            {Object.values(PropertyType).map((type: string) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.propertyType && <p className="text-red-500 text-sm mt-1">{errors.propertyType}</p>}
        </div>

        <div>
          <label className="form-label">BHK *</label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.bhk}
            onChange={(e) => handleChange('bhk', parseInt(e.target.value))}
            className="form-input"
            required
          />
          {errors.bhk && <p className="text-red-500 text-sm mt-1">{errors.bhk}</p>}
        </div>

        <div>
          <label className="form-label">Purpose *</label>
          <select
            value={formData.purpose}
            onChange={(e) => handleChange('purpose', e.target.value)}
            className="form-input"
            required
          >
            {Object.values(Purpose).map((purpose: string) => (
              <option key={purpose} value={purpose}>{purpose}</option>
            ))}
          </select>
          {errors.purpose && <p className="text-red-500 text-sm mt-1">{errors.purpose}</p>}
        </div>

        <div>
          <label className="form-label">Timeline *</label>
          <select
            value={formData.timeline}
            onChange={(e) => handleChange('timeline', e.target.value)}
            className="form-input"
            required
          >
            {Object.values(Timeline).map((timeline: string) => (
              <option key={timeline} value={timeline}>{timeline}</option>
            ))}
          </select>
          {errors.timeline && <p className="text-red-500 text-sm mt-1">{errors.timeline}</p>}
        </div>

        <div>
          <label className="form-label">Budget Min (₹) *</label>
          <input
            type="number"
            min="0"
            value={formData.budgetMin}
            onChange={(e) => handleChange('budgetMin', parseInt(e.target.value))}
            className="form-input"
            required
          />
          {errors.budgetMin && <p className="text-red-500 text-sm mt-1">{errors.budgetMin}</p>}
        </div>

        <div>
          <label className="form-label">Budget Max (₹) *</label>
          <input
            type="number"
            min="0"
            value={formData.budgetMax}
            onChange={(e) => handleChange('budgetMax', parseInt(e.target.value))}
            className="form-input"
            required
          />
          {errors.budgetMax && <p className="text-red-500 text-sm mt-1">{errors.budgetMax}</p>}
        </div>

        <div>
          <label className="form-label">Source</label>
          <input
            type="text"
            value={formData.source}
            onChange={(e) => handleChange('source', e.target.value)}
            className="form-input"
            placeholder="Website, Referral, etc."
          />
          {errors.source && <p className="text-red-500 text-sm mt-1">{errors.source}</p>}
        </div>

        <div>
          <label className="form-label">Status</label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="form-input"
          >
            {Object.values(BuyerStatus).map((status: string) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
        </div>
      </div>

      <div>
        <label className="form-label">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          className="form-input"
          rows={3}
          placeholder="Additional notes about the buyer..."
        />
        {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes}</p>}
      </div>

      <div>
        <label className="form-label">Tags</label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => handleChange('tags', e.target.value)}
          className="form-input"
          placeholder="urgent, first-time-buyer, premium (comma separated)"
        />
        {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : mode === 'create' ? 'Create Buyer' : 'Update Buyer'}
        </button>
      </div>
    </form>
  );
}
