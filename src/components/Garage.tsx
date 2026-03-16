import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Car, Plus, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Vehicle } from '../types';
import { SkeletonCard } from './SkeletonLoader';
import { useFocusTrap } from '../hooks/useFocusTrap';
import VehicleForm, { VehicleFormData } from './VehicleForm';

export default function Garage() {
  const { vehicles, setVehicles, addNotification } = useAppContext();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Focus trap for delete modal (Feature 8)
  const deleteModalRef = useFocusTrap(!!vehicleToDelete);

  // Skeleton loading (Feature 7)
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const onSubmit = (data: VehicleFormData) => {
    if (editingId) {
      setVehicles(vehicles.map(v => v.id === editingId ? { ...data, id: editingId } as Vehicle : v));
      addNotification('Vehicle Updated', 'Your vehicle details have been updated.', 'success');
    } else {
      setVehicles([
        ...vehicles,
        { ...data, id: `veh-${Date.now()}` } as Vehicle,
      ]);
      addNotification('Vehicle Added', 'New vehicle added to your garage.', 'success');
    }
    setIsAdding(false);
    setEditingId(null);
  };

  const confirmDelete = () => {
    if (vehicleToDelete) {
      setVehicles(vehicles.filter((v) => v.id !== vehicleToDelete));
      setVehicleToDelete(null);
      addNotification('Vehicle Deleted', 'Vehicle removed from your garage.', 'info');
    }
  };

  const startEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  // Close delete modal on Escape (Feature 8)
  useEffect(() => {
    const handleEscape = () => setVehicleToDelete(null);
    document.addEventListener('modal-escape' as any, handleEscape);
    return () => document.removeEventListener('modal-escape' as any, handleEscape);
  }, []);

  return (
    <div className="min-h-screen bg-bg flex flex-col transition-colors">
      <header className="bg-surface border-b-2 border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10 transition-colors">
        <div className="flex items-center">
          <button onClick={() => navigate('/')} className="mr-4 text-text hover:text-primary transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-heading font-bold text-xl text-text uppercase tracking-wider">My Garage</h1>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-primary font-heading font-bold uppercase tracking-wider flex items-center hover:underline"
          >
            <Plus size={20} className="mr-1" /> Add
          </button>
        )}
      </header>

      <main className="flex-1 p-6 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {isAdding ? (
            <VehicleForm
              key="vehicle-form"
              editingId={editingId}
              initialData={vehicles.find(v => v.id === editingId)}
              onSubmit={onSubmit}
              onCancel={cancelEdit}
            />
          ) : (
            <motion.div
              key="vehicle-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {isLoading ? (
                // Skeleton Loading (Feature 7)
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : vehicles.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center">
                  <div className="w-20 h-20 bg-surface border-2 border-border rounded-sm flex items-center justify-center mb-4 shadow-brutal-sm transition-colors">
                    <Car size={40} className="text-muted" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-text mb-2 uppercase tracking-wider">No vehicles added</h3>
                  <p className="text-muted font-body mb-6">Add your car or bike to order fuel easily.</p>
                  <button
                    onClick={() => setIsAdding(true)}
                    className="btn-primary px-6 py-3"
                  >
                    Add Vehicle
                  </button>
                </div>
              ) : (
                vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="card-brutal p-5 flex items-center justify-between transition-colors hover:border-primary group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-surface border-2 border-border rounded-sm flex items-center justify-center text-primary shadow-brutal-sm transition-colors group-hover:bg-primary group-hover:text-bg">
                        <Car size={24} />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-text text-lg uppercase tracking-wider">{vehicle.make} {vehicle.model}</h3>
                        <div className="flex items-center text-sm text-muted mt-1 font-body">
                          <span className="bg-surface border-2 border-border px-2 py-0.5 rounded-sm font-mono text-xs mr-2 transition-colors text-text">
                            {vehicle.licensePlate}
                          </span>
                          <span className="uppercase tracking-wider text-xs font-bold">• {vehicle.fuelType}</span>
                          {vehicle.tankCapacity && (
                            <span className="uppercase tracking-wider text-xs font-bold">• {vehicle.tankCapacity}L tank</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(vehicle)}
                        className="p-2 text-muted hover:text-primary transition-colors border-2 border-transparent hover:border-primary rounded-sm hover:bg-surface"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => setVehicleToDelete(vehicle.id)}
                        className="p-2 text-muted hover:text-red-500 transition-colors border-2 border-transparent hover:border-red-500 rounded-sm hover:bg-surface"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Delete Confirmation Modal (with focus trap - Feature 8) */}
      <AnimatePresence>
        {vehicleToDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              ref={deleteModalRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border-2 border-border rounded-sm p-6 w-full max-w-sm shadow-brutal transition-colors"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-dialog-title"
            >
              <div className="w-12 h-12 bg-red-500/20 border-2 border-red-500 rounded-sm flex items-center justify-center mb-4 text-red-500 transition-colors shadow-brutal-sm">
                <Trash2 size={24} />
              </div>
              <h3 id="delete-dialog-title" className="text-xl font-heading font-bold text-text mb-2 uppercase tracking-wider">Delete Vehicle?</h3>
              <p className="text-muted font-body mb-6">Are you sure you want to remove this vehicle from your garage? This action cannot be undone.</p>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setVehicleToDelete(null)}
                  className="btn-secondary flex-1 py-3"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 px-4 bg-red-500 text-bg border-2 border-border rounded-sm font-heading font-bold uppercase tracking-wider hover:bg-red-600 transition-colors shadow-brutal hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-brutal-sm"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
