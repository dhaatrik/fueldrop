import React from 'react';
import { motion } from 'motion/react';
import { Droplets, Car, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function RefillReminders() {
  const { vehicles } = useAppContext();
  const navigate = useNavigate();

  const vehiclesWithData = vehicles.filter(v => v.tankCapacity && v.avgDailyKm);

  if (vehiclesWithData.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <h3 className="font-heading font-bold text-lg text-text uppercase tracking-wider mb-3 flex items-center">
        <Droplets size={18} className="mr-2 text-primary" /> Refill Reminders
      </h3>
      <div className="space-y-3">
        {vehiclesWithData.map(vehicle => {
          const fuelEfficiency = vehicle.fuelType === 'Petrol' ? 15 : 20; // km/L estimate
          const dailyFuelUsage = (vehicle.avgDailyKm || 1) / fuelEfficiency;
          const daysUntilEmpty = Math.floor((vehicle.tankCapacity || 1) / dailyFuelUsage);
          const isUrgent = daysUntilEmpty <= 3;
          const isWarning = daysUntilEmpty <= 7;

          return (
            <div
              key={vehicle.id}
              className={`card-brutal p-4 transition-colors ${
                isUrgent ? 'border-red-500 bg-red-500/5' : isWarning ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-sm border-2 border-border flex items-center justify-center shadow-brutal-sm ${
                    isUrgent ? 'bg-red-500 text-white' : 'bg-surface text-primary'
                  }`}>
                    {isUrgent ? <AlertCircle size={20} /> : <Car size={20} />}
                  </div>
                  <div>
                    <p className="font-heading font-bold text-text text-sm uppercase tracking-wider">
                      {vehicle.make} {vehicle.model}
                    </p>
                    <p className={`text-xs font-heading font-bold ${
                      isUrgent ? 'text-red-500' : isWarning ? 'text-primary' : 'text-accent'
                    }`}>
                      {isUrgent ? `⚠ Refill in ~${daysUntilEmpty} days!` : `~${daysUntilEmpty} days until refill`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/order')}
                  className="text-xs font-heading font-bold bg-primary text-bg px-3 py-1.5 rounded-sm border-2 border-border shadow-brutal-sm hover:translate-y-px hover:shadow-none transition-all"
                >
                  REFILL
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
