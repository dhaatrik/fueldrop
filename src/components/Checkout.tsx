import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CreditCard, Wallet, Tag, CheckCircle2, MapPin, Fuel, ArrowRight, Heart } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Order } from '../types';

export default function Checkout() {
  const { currentOrder, setCurrentView, setOrders, orders, addNotification, favoriteOrders, setFavoriteOrders } = useAppContext();
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [saveAsFavorite, setSaveAsFavorite] = useState(false);
  const [favoriteName, setFavoriteName] = useState('');

  if (!currentOrder) {
    setCurrentView('order');
    return null;
  }

  const deliveryFee = 49;
  const subtotal = currentOrder.amountRupees || 0;
  const gst = subtotal * 0.18; // 18% GST
  const total = subtotal + deliveryFee + gst - discount;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'FIRST50') {
      setDiscount(50);
      addNotification('Promo Applied!', '₹50 discount applied to your order.', 'success');
    } else {
      addNotification('Invalid Promo Code', 'Please enter a valid promo code.', 'warning');
      setDiscount(0);
    }
  };

  const handlePlaceOrder = () => {
    setShowConfirmModal(true);
  };

  const confirmOrder = () => {
    const newOrder: Order = {
      ...currentOrder,
      id: `ord-${Date.now()}`,
      userId: 'user-1',
      status: 'Pending',
      date: new Date().toISOString(),
      paymentMethod,
      totalAmount: total,
    } as Order;

    setOrders([newOrder, ...orders]);

    if (saveAsFavorite && favoriteName) {
      setFavoriteOrders([
        ...favoriteOrders,
        {
          id: `fav-${Date.now()}`,
          name: favoriteName,
          vehicleId: currentOrder.vehicleId!,
          fuelType: currentOrder.fuelType!,
          orderType: currentOrder.amountRupees ? 'amount' : 'quantity',
          value: currentOrder.amountRupees || currentOrder.quantityLiters || 0,
          location: currentOrder.location!
        }
      ]);
      addNotification('Favorite Saved', `"${favoriteName}" has been saved to your favorites.`, 'success');
    }

    setShowConfirmModal(false);
    setCurrentView('tracking');
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col transition-colors">
      <header className="bg-surface border-b-2 border-border px-6 py-4 flex items-center sticky top-0 z-10 transition-colors">
        <button onClick={() => setCurrentView('order')} className="mr-4 text-text hover:text-primary transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-heading font-bold text-xl text-text uppercase tracking-wider">Checkout</h1>
      </header>

      <main className="flex-1 p-6 max-w-md mx-auto w-full space-y-6">
        {/* Order Summary */}
        <section className="card-brutal p-6 transition-colors">
          <h2 className="label-small mb-4">Order Summary</h2>
          
          <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-border transition-colors">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-bg border-2 border-border rounded-sm flex items-center justify-center text-primary mr-4 transition-colors shadow-brutal-sm">
                <Fuel size={24} />
              </div>
              <div>
                <p className="font-heading font-bold text-text uppercase tracking-wider">{currentOrder.fuelType}</p>
                <p className="text-sm text-muted font-body">{currentOrder.quantityLiters?.toFixed(2)} Liters</p>
              </div>
            </div>
            <p className="font-heading font-bold text-lg text-text">₹{subtotal.toFixed(2)}</p>
          </div>

          <div className="flex items-start space-x-3 text-sm text-text font-body">
            <MapPin size={18} className="shrink-0 mt-0.5 text-primary" />
            <p className="line-clamp-2">{currentOrder.location?.address}</p>
          </div>
        </section>

        {/* Offers */}
        <section className="card-brutal p-6 transition-colors">
          <h2 className="label-small mb-4">Offers & Benefits</h2>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter Promo Code"
                className="input-brutal pl-10 uppercase"
              />
            </div>
            <button
              onClick={handleApplyPromo}
              className="btn-secondary px-6"
            >
              Apply
            </button>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="card-brutal p-6 transition-colors">
          <h2 className="label-small mb-4">Payment Method</h2>
          <div className="space-y-3">
            <label className={`flex items-center justify-between p-4 rounded-sm border-2 cursor-pointer transition-all ${
              paymentMethod === 'upi' ? 'border-primary bg-surface shadow-brutal-sm' : 'border-border bg-bg hover:border-muted'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-bg border-2 border-border rounded-sm flex items-center justify-center shadow-brutal-sm transition-colors">
                  <span className="font-heading font-bold text-primary text-xs uppercase tracking-wider">UPI</span>
                </div>
                <span className="font-heading font-bold text-text uppercase tracking-wider text-sm">UPI (GPay, PhonePe)</span>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === 'upi' ? 'border-primary' : 'border-border'
              }`}>
                {paymentMethod === 'upi' && <div className="w-3 h-3 bg-primary rounded-full" />}
              </div>
            </label>

            <label className={`flex items-center justify-between p-4 rounded-sm border-2 cursor-pointer transition-all ${
              paymentMethod === 'card' ? 'border-primary bg-surface shadow-brutal-sm' : 'border-border bg-bg hover:border-muted'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-bg border-2 border-border rounded-sm flex items-center justify-center shadow-brutal-sm text-text transition-colors">
                  <CreditCard size={20} />
                </div>
                <span className="font-heading font-bold text-text uppercase tracking-wider text-sm">Credit / Debit Card</span>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === 'card' ? 'border-primary' : 'border-border'
              }`}>
                {paymentMethod === 'card' && <div className="w-3 h-3 bg-primary rounded-full" />}
              </div>
            </label>

            <label className={`flex items-center justify-between p-4 rounded-sm border-2 cursor-pointer transition-all ${
              paymentMethod === 'cash' ? 'border-primary bg-surface shadow-brutal-sm' : 'border-border bg-bg hover:border-muted'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-bg border-2 border-border rounded-sm flex items-center justify-center shadow-brutal-sm text-text transition-colors">
                  <Wallet size={20} />
                </div>
                <span className="font-heading font-bold text-text uppercase tracking-wider text-sm">Cash on Delivery</span>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === 'cash' ? 'border-primary' : 'border-border'
              }`}>
                {paymentMethod === 'cash' && <div className="w-3 h-3 bg-primary rounded-full" />}
              </div>
            </label>
          </div>
        </section>

        {/* Bill Details */}
        <section className="card-brutal p-6 transition-colors">
          <h2 className="label-small mb-4">Bill Details</h2>
          <div className="space-y-3 text-sm font-body">
            <div className="flex justify-between text-muted">
              <span>Item Total</span>
              <span className="font-heading font-bold text-text">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>GST (18%)</span>
              <span className="font-heading font-bold text-text">₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Delivery Fee</span>
              <span className="font-heading font-bold text-text">₹{deliveryFee.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-primary font-bold">
                <span>Promo Discount</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="h-px bg-border my-4 transition-colors" />
            <div className="flex justify-between font-heading font-bold text-lg text-text">
              <span className="uppercase tracking-wider">To Pay</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        <div className="pb-8">
          <button
            onClick={handlePlaceOrder}
            className="btn-primary w-full py-4 text-lg flex items-center justify-center"
          >
            Place Order <ArrowRight size={20} className="ml-2" />
          </button>
        </div>
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
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
              className="card-brutal p-6 w-full max-w-sm transition-colors"
            >
              <h3 className="text-xl font-heading font-bold text-text uppercase tracking-wider mb-4">Confirm Order</h3>
              
              <div className="bg-bg border-2 border-border rounded-sm p-4 mb-6 space-y-3 transition-colors">
                <div className="flex justify-between text-sm font-body">
                  <span className="text-muted">Fuel</span>
                  <span className="font-heading font-bold text-text uppercase tracking-wider">{currentOrder.fuelType} ({currentOrder.quantityLiters?.toFixed(2)}L)</span>
                </div>
                <div className="flex justify-between text-sm font-body">
                  <span className="text-muted">Total</span>
                  <span className="font-heading font-bold text-primary">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-body">
                  <span className="text-muted">Payment</span>
                  <span className="font-heading font-bold text-text uppercase tracking-wider">{paymentMethod}</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={saveAsFavorite}
                    onChange={(e) => setSaveAsFavorite(e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary rounded-sm focus:ring-primary border-2 border-border bg-bg accent-primary"
                  />
                  <div>
                    <span className="text-sm font-heading font-bold text-text uppercase tracking-wider flex items-center">
                      Save as Favorite <Heart size={14} className="ml-1 text-primary" />
                    </span>
                    <p className="text-xs text-muted font-body mt-0.5">Quickly reorder this exact fuel amount and location next time.</p>
                  </div>
                </label>
                
                <AnimatePresence>
                  {saveAsFavorite && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <input
                        type="text"
                        value={favoriteName}
                        onChange={(e) => setFavoriteName(e.target.value)}
                        placeholder="e.g., Home Car Refill"
                        className="input-brutal text-sm"
                        required={saveAsFavorite}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="btn-secondary flex-1 py-3"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmOrder}
                  disabled={saveAsFavorite && !favoriteName.trim()}
                  className="btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
