import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Heart, Fuel, MapPin, ArrowRight, Trash2, Edit2, Check, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Favorites() {
  const { favoriteOrders, setFavoriteOrders, setCurrentView, setCurrentOrder, vehicles, addNotification } = useAppContext();

  const [favoriteToDelete, setFavoriteToDelete] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      setFavoriteOrders(favoriteOrders.map(fav => fav.id === id ? { ...fav, name: editName } : fav));
      addNotification('Favorite Updated', 'Favorite name has been updated.', 'success');
    }
    setEditingId(null);
  };

  const handleReorder = (favorite: typeof favoriteOrders[0]) => {
    // Check if the vehicle still exists
    const vehicleExists = vehicles.some(v => v.id === favorite.vehicleId);
    if (!vehicleExists) {
      addNotification('Vehicle Not Found', 'The vehicle associated with this favorite order no longer exists. Please create a new order.', 'warning');
      return;
    }

    setCurrentOrder({
      vehicleId: favorite.vehicleId,
      fuelType: favorite.fuelType,
      amountRupees: favorite.orderType === 'amount' ? favorite.value : undefined,
      quantityLiters: favorite.orderType === 'quantity' ? favorite.value : undefined,
      location: favorite.location,
    });
    setCurrentView('checkout');
  };

  const handleDelete = (id: string) => {
    setFavoriteToDelete(id);
  };

  const confirmDelete = () => {
    if (favoriteToDelete) {
      setFavoriteOrders(favoriteOrders.filter(fav => fav.id !== favoriteToDelete));
      setFavoriteToDelete(null);
      addNotification('Favorite Deleted', 'Favorite order removed.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col transition-colors">
      <header className="bg-surface border-b-2 border-border px-6 py-4 flex items-center sticky top-0 z-10 transition-colors">
        <button onClick={() => setCurrentView('profile')} className="mr-4 text-text hover:text-primary transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-heading font-bold text-xl text-text uppercase tracking-wider">Favorite Orders</h1>
      </header>

      <main className="flex-1 p-6 max-w-md mx-auto w-full space-y-4">
        {favoriteOrders.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center">
            <div className="w-20 h-20 bg-surface border-2 border-border rounded-sm flex items-center justify-center mb-4 shadow-brutal-sm transition-colors">
              <Heart size={40} className="text-muted" />
            </div>
            <h3 className="text-lg font-heading font-bold text-text mb-2 uppercase tracking-wider">No favorites yet</h3>
            <p className="text-muted font-body text-center max-w-[250px]">
              Save your frequent orders during checkout for quick reordering later.
            </p>
            <button 
              onClick={() => setCurrentView('order')}
              className="mt-6 btn-primary px-6 py-3"
            >
              Order Fuel Now
            </button>
          </div>
        ) : (
          favoriteOrders.map((favorite, index) => {
            const vehicle = vehicles.find(v => v.id === favorite.vehicleId);
            
            return (
              <motion.div
                key={favorite.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card-brutal p-5 transition-colors hover:border-primary"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-surface border-2 border-border rounded-sm flex items-center justify-center text-primary shadow-brutal-sm transition-colors">
                      <Heart size={20} className="fill-current" />
                    </div>
                    <div>
                      {editingId === favorite.id ? (
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="input-brutal py-1 px-2 text-sm w-32"
                            autoFocus
                          />
                          <button onClick={() => handleSaveEdit(favorite.id)} className="ml-2 text-primary hover:text-accent">
                            <Check size={18} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="ml-1 text-muted hover:text-red-500">
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <h3 className="font-heading font-bold text-text uppercase tracking-wider flex items-center">
                          {favorite.name}
                          <button 
                            onClick={() => {
                              setEditingId(favorite.id);
                              setEditName(favorite.name);
                            }}
                            className="ml-2 text-muted hover:text-primary"
                          >
                            <Edit2 size={14} />
                          </button>
                        </h3>
                      )}
                      <p className="text-xs text-muted font-body mt-0.5">
                        {vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})` : 'Vehicle Deleted'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(favorite.id)}
                    className="p-2 text-muted hover:text-red-500 hover:bg-bg rounded-sm transition-colors border-2 border-transparent hover:border-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="bg-bg border-2 border-border rounded-sm p-3 mb-4 space-y-2 transition-colors">
                  <div className="flex items-center text-sm">
                    <Fuel size={16} className="text-primary mr-2 shrink-0" />
                    <span className="text-text font-body">
                      <span className="font-heading font-bold uppercase tracking-wider">{favorite.fuelType}</span>
                      <span className="mx-2 text-muted">•</span>
                      {favorite.orderType === 'amount' ? `₹${favorite.value}` : `${favorite.value} Liters`}
                    </span>
                  </div>
                  <div className="flex items-start text-sm">
                    <MapPin size={16} className="text-primary mr-2 mt-0.5 shrink-0" />
                    <span className="text-text font-body line-clamp-1">{favorite.location.address}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleReorder(favorite)}
                  className="btn-secondary w-full py-3 flex items-center justify-center"
                >
                  Reorder Now <ArrowRight size={16} className="ml-2" />
                </button>
              </motion.div>
            );
          })
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {favoriteToDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border-2 border-border rounded-sm p-6 w-full max-w-sm shadow-brutal transition-colors"
            >
              <div className="w-12 h-12 bg-red-500/20 border-2 border-red-500 rounded-sm flex items-center justify-center mb-4 text-red-500 transition-colors shadow-brutal-sm">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-heading font-bold text-text mb-2 uppercase tracking-wider">Delete Favorite?</h3>
              <p className="text-muted font-body mb-6">Are you sure you want to remove this favorite order? This action cannot be undone.</p>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setFavoriteToDelete(null)}
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
