import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDynamicPricing } from './useDynamicPricing';
import { Location } from '../types';

describe('useDynamicPricing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockLocation: Location = { lat: 12.9716, lng: 77.5946, address: 'Test' };

  describe('Base Fee and ETA', () => {
    it('uses fallback values when location is null', () => {
      // Set time to 12:00 PM (no surge)
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      vi.setSystemTime(date);

      const { result } = renderHook(() => useDynamicPricing(null, 10, 'Petrol'));

      expect(result.current.deliveryFee).toBe(29); // Default base fee
      expect(result.current.estimatedMinutes).toBe(8); // Default base minutes + 0 quantity penalty
    });

    it('uses fallback values when location latitude is 0', () => {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      vi.setSystemTime(date);

      const invalidLocation: Location = { lat: 0, lng: 0, address: 'Invalid' };
      const { result } = renderHook(() => useDynamicPricing(invalidLocation, 10, 'Petrol'));

      expect(result.current.deliveryFee).toBe(29);
      expect(result.current.estimatedMinutes).toBe(8);
    });

    it('calculates fees and ETA correctly for a valid location without surge and small quantity', () => {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      vi.setSystemTime(date);

      // Hub: 12.9716, 77.5946
      // Simulate distance from hub: roughly 10km away.
      // 10km / 111 = 0.09 offset in latitude
      const distantLocation: Location = { lat: 12.9716 + 0.09, lng: 77.5946, address: 'Test' };
      const { result } = renderHook(() => useDynamicPricing(distantLocation, 10, 'Petrol'));

      // Expected calculation:
      // distKm = sqrt( (0.09 * 111)^2 ) = ~9.99
      // baseFee = min(99, max(29, round(29 + 9.99 * 7))) = min(99, max(29, round(29 + 69.93))) = round(98.93) = 99
      // fee = baseFee * surge = 99 * 1.0 = 99
      expect(result.current.deliveryFee).toBe(99);

      // ETA Calculation:
      // baseMinutes = min(25, max(8, round(8 + 9.99 * 2))) = round(8 + 19.98) = 28 -> capped at 25
      // penalty (qty 10) = 0
      // total minutes = 25
      expect(result.current.estimatedMinutes).toBe(25);
    });

    it('adds quantity penalty to ETA for medium quantities (>10 and <=20)', () => {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      vi.setSystemTime(date);

      const { result } = renderHook(() => useDynamicPricing(mockLocation, 15, 'Petrol'));

      // mockLocation is exactly at hub:
      // distKm = 0.
      // baseMinutes = min(25, max(8, round(8 + 0))) = 8.
      // penalty for 15 (qty > 10) = 2.
      // total = 8 + 2 = 10.
      expect(result.current.estimatedMinutes).toBe(10);
    });

    it('adds quantity penalty to ETA for large quantities (>20)', () => {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      vi.setSystemTime(date);

      const { result } = renderHook(() => useDynamicPricing(mockLocation, 25, 'Petrol'));

      // mockLocation is exactly at hub:
      // baseMinutes = 8.
      // penalty for 25 (qty > 20) = 3.
      // total = 8 + 3 = 11.
      expect(result.current.estimatedMinutes).toBe(11);
    });

    it('combines distance, surge, and quantity calculations correctly', () => {
      // Set to peak hour to apply surge (1.3)
      const date = new Date();
      date.setHours(9, 0, 0, 0);
      vi.setSystemTime(date);

      // Half distance to reach around 5km.
      // 5km / 111 = ~0.045 lat offset
      const midLocation: Location = { lat: 12.9716 + 0.045, lng: 77.5946, address: 'Mid' };
      const { result } = renderHook(() => useDynamicPricing(midLocation, 21, 'Diesel'));

      // Calculation:
      // distKm = sqrt((0.045*111)^2) = ~4.995
      // baseFee = round(29 + 4.995 * 7) = round(29 + 34.965) = 64
      // finalFee = 64 * 1.3 = 83.2 -> round = 83
      expect(result.current.deliveryFee).toBe(83);

      // ETA:
      // baseMinutes = round(8 + 4.995 * 2) = round(8 + 9.99) = 18
      // penalty = 3
      // estimatedMinutes = 18 + 3 = 21
      expect(result.current.estimatedMinutes).toBe(21);
    });
  });

  describe('Surge Pricing', () => {
    it('applies surge pricing during morning peak hours (8-10 AM)', () => {
      // Set time to 9:00 AM
      const date = new Date();
      date.setHours(9, 0, 0, 0);
      vi.setSystemTime(date);

      const { result } = renderHook(() => useDynamicPricing(mockLocation, 10, 'Petrol'));

      expect(result.current.surgeActive).toBe(true);
      expect(result.current.surgeFactor).toBe(1.3);
    });

    it('applies surge pricing during evening peak hours (5-8 PM)', () => {
      // Set time to 6:00 PM (18:00)
      const date = new Date();
      date.setHours(18, 0, 0, 0);
      vi.setSystemTime(date);

      const { result } = renderHook(() => useDynamicPricing(mockLocation, 10, 'Petrol'));

      expect(result.current.surgeActive).toBe(true);
      expect(result.current.surgeFactor).toBe(1.3);
    });

    it('does not apply surge pricing during off-peak hours', () => {
      // Set time to 12:00 PM
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      vi.setSystemTime(date);

      const { result } = renderHook(() => useDynamicPricing(mockLocation, 10, 'Petrol'));

      expect(result.current.surgeActive).toBe(false);
      expect(result.current.surgeFactor).toBe(1.0);
    });
  });

});
