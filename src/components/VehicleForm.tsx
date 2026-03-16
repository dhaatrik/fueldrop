import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import LicensePlateInput from './LicensePlateInput';

// Zod schema for vehicle form (Feature 9)
export const vehicleSchema = z.object({
  type: z.enum(['Car', 'Bike']),
  fuelType: z.enum(['Petrol', 'Diesel']),
  make: z.string().min(1, 'Make is required').max(30, 'Too long'),
  model: z.string().min(1, 'Model is required').max(30, 'Too long'),
  licensePlate: z.string().min(9, 'Enter a complete license plate (e.g., KA 01 AB 1234)'),
  tankCapacity: z.number().min(1).max(200).optional(),
  avgDailyKm: z.number().min(1).max(500).optional(),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;

interface VehicleFormProps {
  editingId: string | null;
  initialData?: Partial<VehicleFormData>;
  onSubmit: (data: VehicleFormData) => void;
  onCancel: () => void;
}

export default function VehicleForm({ editingId, initialData, onSubmit, onCancel }: VehicleFormProps) {
  const { register, handleSubmit, formState: { errors, touchedFields }, reset, setValue: setFormValue, watch } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      type: 'Car',
      fuelType: 'Petrol',
      make: '',
      model: '',
      licensePlate: '',
      tankCapacity: undefined,
      avgDailyKm: undefined,
    },
  });

  // Effect to reset form when editing existing vehicle
  useEffect(() => {
    if (initialData) {
      reset({
        type: initialData.type || 'Car',
        fuelType: initialData.fuelType || 'Petrol',
        make: initialData.make || '',
        model: initialData.model || '',
        licensePlate: initialData.licensePlate || '',
        tankCapacity: initialData.tankCapacity,
        avgDailyKm: initialData.avgDailyKm,
      });
    } else {
      reset({
        type: 'Car',
        fuelType: 'Petrol',
        make: '',
        model: '',
        licensePlate: '',
        tankCapacity: undefined,
        avgDailyKm: undefined,
      });
    }
  }, [initialData, reset]);

  const licensePlateValue = watch('licensePlate');

  return (
    <motion.div
      key="add-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card-brutal p-6 transition-colors"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-heading font-bold text-text uppercase tracking-wider">{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
        <button onClick={onCancel} className="text-muted hover:text-text transition-colors" type="button">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-small">Type</label>
            <select {...register('type')} className="input-brutal">
              <option value="Car">Car</option>
              <option value="Bike">Bike</option>
            </select>
            {errors.type && <p className="text-red-500 text-xs font-body mt-1">{errors.type.message}</p>}
          </div>
          <div>
            <label className="label-small">Fuel Type</label>
            <select {...register('fuelType')} className="input-brutal">
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
            </select>
            {errors.fuelType && <p className="text-red-500 text-xs font-body mt-1">{errors.fuelType.message}</p>}
          </div>
        </div>

        <div>
          <label className="label-small">Make (e.g., Hyundai)</label>
          <input
            type="text"
            {...register('make')}
            className={`input-brutal ${errors.make && touchedFields.make ? 'border-red-500' : ''}`}
            placeholder="Enter make"
          />
          {errors.make && touchedFields.make && (
            <p className="text-red-500 text-xs font-body mt-1">{errors.make.message}</p>
          )}
        </div>

        <div>
          <label className="label-small">Model (e.g., i20)</label>
          <input
            type="text"
            {...register('model')}
            className={`input-brutal ${errors.model && touchedFields.model ? 'border-red-500' : ''}`}
            placeholder="Enter model"
          />
          {errors.model && touchedFields.model && (
            <p className="text-red-500 text-xs font-body mt-1">{errors.model.message}</p>
          )}
        </div>

        <div>
          <label className="label-small">License Plate</label>
          <LicensePlateInput
            value={licensePlateValue}
            onChange={(val) => setFormValue('licensePlate', val, { shouldValidate: true, shouldTouch: true })}
          />
          {errors.licensePlate && touchedFields.licensePlate && (
            <p className="text-red-500 text-xs font-body mt-1">{errors.licensePlate.message}</p>
          )}
        </div>

        {/* Feature 6: Tank Capacity & Daily Run */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-small">Tank Capacity (L) <span className="text-muted font-normal">(optional)</span></label>
            <input
              type="number"
              {...register('tankCapacity', { valueAsNumber: true })}
              className={`input-brutal ${errors.tankCapacity ? 'border-red-500' : ''}`}
              placeholder="e.g., 45"
            />
            {errors.tankCapacity && (
              <p className="text-red-500 text-xs font-body mt-1">{errors.tankCapacity.message}</p>
            )}
          </div>
          <div>
            <label className="label-small">Avg Daily Km <span className="text-muted font-normal">(optional)</span></label>
            <input
              type="number"
              {...register('avgDailyKm', { valueAsNumber: true })}
              className={`input-brutal ${errors.avgDailyKm ? 'border-red-500' : ''}`}
              placeholder="e.g., 30"
            />
            {errors.avgDailyKm && (
              <p className="text-red-500 text-xs font-body mt-1">{errors.avgDailyKm.message}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-4 mt-6"
        >
          {editingId ? 'Save Changes' : 'Add Vehicle'}
        </button>
      </form>
    </motion.div>
  );
}
