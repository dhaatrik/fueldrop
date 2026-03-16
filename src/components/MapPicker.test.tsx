import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import MapPicker from './MapPicker';
import { AppProvider } from '../context/AppContext';
import React from 'react';

// Mock Leaflet and its components because they require a DOM
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="marker" />,
  useMapEvents: () => ({}),
}));

// Mock browser global fetch
const originalFetch = global.fetch;

describe('MapPicker', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('handles geocoding fetch error correctly', async () => {
    // Force fetch to reject to simulate network failure or service down
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    // Also mock geolocation to instantly trigger reverseGeocode
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success) =>
        success({
          coords: {
            latitude: 12.9716,
            longitude: 77.5946,
          }
        })
      )
    };
    (global.navigator as any).geolocation = mockGeolocation;

    const mockOnLocationSelect = vi.fn();

    render(
      <AppProvider>
        <MapPicker location={null} onLocationSelect={mockOnLocationSelect} />
      </AppProvider>
    );

    // Find and click the Detect GPS button
    const detectGpsButton = screen.getByText(/Detect GPS/i);
    await act(async () => {
        detectGpsButton.click();
    });

    // Wait for the fallback coordinate selection to be called
    await waitFor(() => {
      expect(mockOnLocationSelect).toHaveBeenCalledWith({
        lat: 12.9716,
        lng: 77.5946,
        address: '12.9716, 77.5946'
      });
    });
  });
});
