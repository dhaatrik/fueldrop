import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Vehicle, Order, ViewState, Location, FavoriteOrder, AppNotification } from '../types';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  vehicles: Vehicle[];
  setVehicles: (vehicles: Vehicle[]) => void;
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  currentOrder: Partial<Order> | null;
  setCurrentOrder: (order: Partial<Order> | null) => void;
  location: Location | null;
  setLocation: (location: Location | null) => void;
  favoriteOrders: FavoriteOrder[];
  setFavoriteOrders: (favorites: FavoriteOrder[]) => void;
  notifications: AppNotification[];
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
  markNotificationRead: (id: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [currentOrder, setCurrentOrder] = useState<Partial<Order> | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [favoriteOrders, setFavoriteOrders] = useState<FavoriteOrder[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setNotifications(prev => [{
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    }, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        vehicles,
        setVehicles,
        orders,
        setOrders,
        currentView,
        setCurrentView,
        currentOrder,
        setCurrentOrder,
        location,
        setLocation,
        favoriteOrders,
        setFavoriteOrders,
        notifications,
        addNotification,
        markNotificationRead,
        darkMode,
        setDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

