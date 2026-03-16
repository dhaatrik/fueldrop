import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AppProvider, useAppContext } from './AppContext';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const TestComponent = () => {
  const { user, setUser, vehicles, setVehicles, savedAddresses, setSavedAddresses, logout, addNotification, markNotificationRead } = useAppContext();

  return (
    <div>
      <div data-testid="user">{user ? user.name : 'No User'}</div>
      <button data-testid="set-user" onClick={() => setUser({ id: '1', name: 'Test User', phone: '1234567890' })}>Set User</button>
      <button data-testid="logout" onClick={() => logout()}>Logout</button>

      <div data-testid="vehicles">{vehicles.length}</div>
      <button data-testid="set-vehicles" onClick={() => setVehicles([{ id: 'v1', type: 'petrol', make: 'Honda', model: 'Civic', plate: 'ABC', fuelCapacity: 40, avgDailyKm: 10 }])}>Set Vehicles</button>

      <div data-testid="saved-addresses">{savedAddresses.length}</div>
      <button data-testid="set-addresses" onClick={() => setSavedAddresses([{ id: 'a1', title: 'Home', address: '123 Main St', lat: 0, lng: 0 }])}>Set Addresses</button>

      <button data-testid="add-notification" onClick={() => addNotification('Test Title', 'Test Message', 'info')}>Add Notification</button>
    </div>
  );
};

describe('AppContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllTimers();
  });

  it('throws an error if useAppContext is used outside of AppProvider', () => {
    // Suppress console.error for expected thrown error in rendering
    const consoleSpy = vi.spyOn(console, 'error');
    consoleSpy.mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow('useAppContext must be used within an AppProvider');

    consoleSpy.mockRestore();
  });

  it('provides initial state', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId('user').textContent).toBe('No User');
    expect(screen.getByTestId('vehicles').textContent).toBe('0');
    expect(screen.getByTestId('saved-addresses').textContent).toBe('0');
  });

  it('updates user state when setUser is called', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    act(() => {
      screen.getByTestId('set-user').click();
    });

    expect(screen.getByTestId('user').textContent).toBe('Test User');
  });

  it('updates vehicles state when setVehicles is called', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    act(() => {
      screen.getByTestId('set-vehicles').click();
    });

    expect(screen.getByTestId('vehicles').textContent).toBe('1');
  });

  it('updates savedAddresses state when setSavedAddresses is called', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    act(() => {
      screen.getByTestId('set-addresses').click();
    });

    expect(screen.getByTestId('saved-addresses').textContent).toBe('1');
  });

  it('logout resets state and clears persisted keys', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    act(() => {
      screen.getByTestId('set-user').click();
      screen.getByTestId('set-vehicles').click();
    });

    expect(screen.getByTestId('user').textContent).toBe('Test User');
    expect(screen.getByTestId('vehicles').textContent).toBe('1');

    act(() => {
      screen.getByTestId('logout').click();
    });

    expect(screen.getByTestId('user').textContent).toBe('No User');
    expect(screen.getByTestId('vehicles').textContent).toBe('0');
  });
});

describe('AppContext Notifications', () => {
  it('adds and ignores duplicate notifications', () => {
    const NotificationTestComponent = () => {
      const { notifications, addNotification } = useAppContext();
      return (
        <div>
          <div data-testid="notification-count">{notifications.length}</div>
          <button data-testid="add-notification" onClick={() => addNotification('T', 'M', 'info')}>Add</button>
        </div>
      );
    };

    render(
      <AppProvider>
        <NotificationTestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId('notification-count').textContent).toBe('0');

    act(() => {
      screen.getByTestId('add-notification').click();
    });

    expect(screen.getByTestId('notification-count').textContent).toBe('1');

    act(() => {
      screen.getByTestId('add-notification').click();
    });

    expect(screen.getByTestId('notification-count').textContent).toBe('1');
  });
});
