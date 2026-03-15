import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Legal({ type }: { type: 'privacy' | 'terms' }) {
  const { setCurrentView, user } = useAppContext();
  const title = type === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions';

  return (
    <div className="min-h-screen bg-bg flex flex-col transition-colors">
      <header className="bg-surface border-b-2 border-border px-6 py-4 flex items-center sticky top-0 z-10 transition-colors">
        <button 
          onClick={() => setCurrentView(user ? 'settings' : 'login')} 
          className="mr-4 text-text hover:text-primary transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-heading font-bold text-xl text-text uppercase tracking-wider">{title}</h1>
      </header>

      <main className="flex-1 p-6 max-w-md mx-auto w-full">
        <div className="card-brutal p-6 text-text transition-colors">
          <h2 className="text-lg font-heading font-bold text-text mb-4 uppercase tracking-wider">{title}</h2>
          <p className="mb-4 text-sm text-muted font-body">Last updated: March 2026</p>
          
          <div className="space-y-4 text-sm leading-relaxed font-body">
            {type === 'privacy' ? (
              <>
                <p><strong className="text-primary">1. Information Collection</strong><br/>We collect your location data to deliver fuel accurately. Your phone number is used for authentication and order updates.</p>
                <p><strong className="text-primary">2. Use of Information</strong><br/>The information collected is used solely for the purpose of providing and improving our fuel delivery service.</p>
                <p><strong className="text-primary">3. Data Sharing</strong><br/>We do not share your personal data with third parties without your explicit consent, except as required by law.</p>
                <p><strong className="text-primary">4. Security</strong><br/>We implement industry-standard security measures to protect your personal information from unauthorized access.</p>
              </>
            ) : (
              <>
                <p><strong className="text-primary">1. Eligibility</strong><br/>You must be at least 18 years old to use this service and have a valid payment method.</p>
                <p><strong className="text-primary">2. Pricing</strong><br/>Fuel prices are subject to change based on market rates. The final price will be confirmed at checkout.</p>
                <p><strong className="text-primary">3. Cancellations</strong><br/>Cancellations after the delivery captain has been dispatched may incur a cancellation fee.</p>
                <p><strong className="text-primary">4. Safety</strong><br/>You must ensure a safe environment for fuel delivery. Our captains reserve the right to refuse delivery if conditions are unsafe.</p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
