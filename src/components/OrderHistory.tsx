import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Fuel, Calendar, MapPin, CheckCircle2, XCircle, Clock, Filter, ArrowUpDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function OrderHistory() {
  const { orders, setCurrentView } = useAppContext();
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle2 size={20} className="text-emerald-500" />;
      case 'Cancelled':
        return <XCircle size={20} className="text-red-500" />;
      default:
        return <Clock size={20} className="text-amber-500" />;
    }
  };

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    if (filterStatus !== 'All') {
      result = result.filter(order => order.status === filterStatus);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.location.address.toLowerCase().includes(query) ||
        order.fuelType.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [orders, filterStatus, sortOrder, searchQuery]);

  return (
    <div className="min-h-screen bg-bg flex flex-col transition-colors">
      <header className="bg-surface border-b-2 border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10 transition-colors">
        <div className="flex items-center">
          <button onClick={() => setCurrentView('home')} className="mr-4 text-text hover:text-primary transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-heading font-bold text-xl text-text uppercase tracking-wider">Order History</h1>
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 border-2 border-border rounded-sm transition-colors ${showFilters ? 'bg-primary text-bg' : 'bg-surface text-text hover:bg-bg'}`}
        >
          <Filter size={20} />
        </button>
      </header>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-surface border-b-2 border-border overflow-hidden transition-colors"
          >
            <div className="p-6 max-w-md mx-auto space-y-6">
              <div>
                <label className="label-small mb-2">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by location or fuel type"
                  className="input-brutal w-full"
                />
              </div>
              <div>
                <label className="label-small mb-2">Filter by Status</label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Delivered', 'Pending', 'Cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 border-2 border-border rounded-sm font-heading font-bold uppercase tracking-wider text-sm transition-colors ${
                        filterStatus === status 
                          ? 'bg-primary text-bg shadow-brutal-sm' 
                          : 'bg-surface text-text hover:bg-bg'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="label-small mb-2">Sort by Date</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortOrder('newest')}
                    className={`flex-1 flex items-center justify-center px-4 py-2 border-2 border-border rounded-sm font-heading font-bold uppercase tracking-wider text-sm transition-colors ${
                      sortOrder === 'newest' 
                        ? 'bg-primary text-bg shadow-brutal-sm' 
                        : 'bg-surface text-text hover:bg-bg'
                    }`}
                  >
                    <ArrowUpDown size={14} className="mr-2" /> Newest
                  </button>
                  <button
                    onClick={() => setSortOrder('oldest')}
                    className={`flex-1 flex items-center justify-center px-4 py-2 border-2 border-border rounded-sm font-heading font-bold uppercase tracking-wider text-sm transition-colors ${
                      sortOrder === 'oldest' 
                        ? 'bg-primary text-bg shadow-brutal-sm' 
                        : 'bg-surface text-text hover:bg-bg'
                    }`}
                  >
                    <ArrowUpDown size={14} className="mr-2" /> Oldest
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 p-6 max-w-md mx-auto w-full space-y-4">
        {filteredAndSortedOrders.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center">
            <div className="w-20 h-20 bg-surface border-2 border-border rounded-sm flex items-center justify-center mb-4 shadow-brutal-sm transition-colors">
              <Fuel size={40} className="text-muted" />
            </div>
            <h3 className="text-lg font-heading font-bold text-text mb-2 uppercase tracking-wider">No orders found</h3>
            <p className="text-muted font-body">Try changing your filters.</p>
          </div>
        ) : (
          filteredAndSortedOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-brutal p-6 transition-colors hover:border-primary"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-sm border-2 border-border flex items-center justify-center shadow-brutal-sm transition-colors ${
                    order.status === 'Delivered' ? 'bg-accent text-bg' : 
                    order.status === 'Cancelled' ? 'bg-surface text-red-500' : 'bg-primary text-bg'
                  }`}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-text uppercase tracking-wider flex items-center">
                      {order.fuelType} <span className="mx-2 text-muted">•</span> {order.quantityLiters?.toFixed(2)}L
                    </h3>
                    <p className="text-xs text-muted font-body flex items-center mt-1">
                      <Calendar size={14} className="mr-1" />
                      {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-heading font-bold text-lg text-text">₹{order.totalAmount}</p>
                  <p className={`text-xs font-heading font-bold uppercase tracking-wider mt-1 ${
                    order.status === 'Delivered' ? 'text-accent' : 
                    order.status === 'Cancelled' ? 'text-red-500' : 'text-primary'
                  }`}>
                    {order.status}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-border transition-colors">
                <p className="text-sm text-muted font-body flex items-start">
                  <MapPin size={16} className="mr-2 mt-0.5 text-primary shrink-0" />
                  <span className="line-clamp-2">{order.location.address}</span>
                </p>
              </div>
            </motion.div>
          ))
        )}
      </main>
    </div>
  );
}
