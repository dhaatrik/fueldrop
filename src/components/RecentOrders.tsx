import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Fuel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import VehicleSelectModal from './VehicleSelectModal';

export default function RecentOrders() {
  const { orders, vehicles, setCurrentOrder } = useAppContext();
  const navigate = useNavigate();

  const recentOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 2);

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [pendingReorder, setPendingReorder] = useState<typeof orders[0] | null>(null);

  const handleReorder = (order: typeof orders[0]) => {
    const vehicle = vehicles.find(v => v.id === order.vehicleId);
    if (vehicle) {
      setCurrentOrder({
        vehicleId: order.vehicleId,
        fuelType: order.fuelType,
        amountRupees: order.amountRupees,
        quantityLiters: order.quantityLiters,
        location: order.location,
      });
      navigate('/checkout');
    } else {
      // Vehicle deleted — show vehicle select modal instead of blocking
      setPendingReorder(order);
      setShowVehicleModal(true);
    }
  };

  const handleVehicleSelected = (vehicleId: string) => {
    if (pendingReorder) {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      setCurrentOrder({
        vehicleId,
        fuelType: vehicle?.fuelType || pendingReorder.fuelType,
        amountRupees: pendingReorder.amountRupees,
        quantityLiters: pendingReorder.quantityLiters,
        location: pendingReorder.location,
      });
      navigate('/checkout');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-lg text-text uppercase tracking-wider">Recent Orders</h3>
          <button onClick={() => navigate('/history')} className="text-sm text-primary font-heading font-bold uppercase tracking-wider hover:underline">See All</button>
        </div>

        <div className="space-y-3">
          {recentOrders.length === 0 ? (
            <div className="card-brutal p-6 text-center transition-colors">
              <p className="text-muted font-body text-sm">No recent orders.</p>
            </div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="card-brutal p-4 flex items-center justify-between transition-colors hover:border-primary">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-bg border-2 border-border rounded-sm flex items-center justify-center mr-3 transition-colors">
                    <Fuel size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-text text-sm uppercase">{order.fuelType} • {order.quantityLiters}L</p>
                    <p className="text-xs text-muted font-body mt-0.5">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="font-heading font-bold text-text text-sm">₹{order.totalAmount}</p>
                  <p className={`text-xs font-heading font-bold uppercase tracking-wider mt-0.5 mb-2 ${
                    order.status === 'Delivered' ? 'text-accent' : 'text-primary'
                  }`}>{order.status}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReorder(order);
                    }}
                    className="text-xs font-heading font-bold bg-surface border-2 border-border px-2 py-1 rounded-sm hover:bg-primary hover:text-bg transition-colors"
                  >
                    REORDER
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      <VehicleSelectModal
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        onSelect={handleVehicleSelected}
        title="Vehicle Deleted"
      />
    </>
  );
}
