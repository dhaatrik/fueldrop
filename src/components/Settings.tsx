import React from 'react';
import { ArrowLeft, Moon, Sun, FileText, Shield, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Settings() {
  const { setCurrentView, darkMode, setDarkMode } = useAppContext();

  return (
    <div className="min-h-screen bg-bg flex flex-col transition-colors">
      <header className="bg-surface border-b-2 border-border px-6 py-4 flex items-center sticky top-0 z-10 transition-colors">
        <button onClick={() => setCurrentView('home')} className="mr-4 text-text hover:text-primary transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-heading font-bold text-xl text-text uppercase tracking-wider">Settings</h1>
      </header>

      <main className="flex-1 p-6 max-w-md mx-auto w-full space-y-6">
        <div className="card-brutal p-4 transition-colors">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center space-x-3 text-text">
              {darkMode ? <Moon size={20} /> : <Sun size={20} />}
              <span className="font-heading font-bold uppercase tracking-wider">Dark Mode</span>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className={`w-14 h-8 rounded-sm border-2 border-border p-1 transition-colors ${darkMode ? 'bg-primary' : 'bg-surface'}`}
            >
              <div className={`w-5 h-5 rounded-sm bg-text transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <div className="card-brutal p-2 transition-colors">
          <button 
            onClick={() => setCurrentView('about')} 
            className="w-full flex items-center justify-between p-4 text-text hover:bg-bg rounded-sm transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Info size={20} className="text-primary" />
              <span className="font-heading font-bold uppercase tracking-wider">About FuelDrop</span>
            </div>
          </button>
          <div className="h-0.5 bg-border mx-4" />
          <button 
            onClick={() => setCurrentView('terms')} 
            className="w-full flex items-center justify-between p-4 text-text hover:bg-bg rounded-sm transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileText size={20} className="text-primary" />
              <span className="font-heading font-bold uppercase tracking-wider">Terms & Conditions</span>
            </div>
          </button>
          <div className="h-0.5 bg-border mx-4" />
          <button 
            onClick={() => setCurrentView('privacy')} 
            className="w-full flex items-center justify-between p-4 text-text hover:bg-bg rounded-sm transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Shield size={20} className="text-primary" />
              <span className="font-heading font-bold uppercase tracking-wider">Privacy Policy</span>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
