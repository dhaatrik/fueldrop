import { describe, it, expect, beforeEach, mock, afterEach } from 'bun:test';
import './setup-bun';
import {
  getActiveOrders,
  publishOrder,
  updateOrderStatus,
  removeOrder,
  onOrderChange
} from './orderBridge';
import { Order } from '../types';

const STORAGE_KEY = 'fd_active_orders';

describe('orderBridge', () => {
  beforeEach(() => {
    localStorage.clear();
    mock.restore();
  });

  afterEach(() => {
    mock.restore();
  });

  describe('getActiveOrders', () => {
    it('should return an empty array when localStorage is empty', () => {
      expect(getActiveOrders()).toEqual([]);
    });

    it('should return orders when localStorage has valid JSON', () => {
      const orders: Order[] = [
        { id: '1', status: 'Pending' } as Order
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
      expect(getActiveOrders()).toEqual(orders);
    });

    it('should return an empty array when localStorage contains invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, '{invalid}');
      expect(getActiveOrders()).toEqual([]);
    });
  });

  describe('publishOrder', () => {
    it('should add a new order to localStorage', () => {
      const order: Order = { id: '1', status: 'Pending' } as Order;
      publishOrder(order);
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      expect(stored).toEqual([order]);
    });

    it('should update an existing order in localStorage', () => {
      const order1: Order = { id: '1', status: 'Pending' } as Order;
      const order2: Order = { id: '1', status: 'Accepted' } as Order;
      publishOrder(order1);
      publishOrder(order2);
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      expect(stored).toEqual([order2]);
    });

    it('should dispatch fd-order-change custom event', () => {
      const dispatchSpy = mock(window.dispatchEvent);
      window.dispatchEvent = dispatchSpy;

      const order: Order = { id: '1', status: 'Pending' } as Order;
      publishOrder(order);
      expect(dispatchSpy).toHaveBeenCalled();
      const event = dispatchSpy.mock.calls.find(call => (call[0] as any).type === 'fd-order-change')?.[0] as any;
      expect(event).toBeDefined();
      expect(event.detail).toEqual([order]);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update the status and captain name of an existing order', () => {
      const order: Order = { id: '1', status: 'Pending' } as Order;
      localStorage.setItem(STORAGE_KEY, JSON.stringify([order]));

      updateOrderStatus('1', 'Accepted', 'Captain Hook');

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      expect(stored[0].status).toBe('Accepted');
      expect(stored[0].captainName).toBe('Captain Hook');
    });

    it('should do nothing if the order ID is not found', () => {
      const order: Order = { id: '1', status: 'Pending' } as Order;
      localStorage.setItem(STORAGE_KEY, JSON.stringify([order]));

      updateOrderStatus('2', 'Accepted');

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      expect(stored).toEqual([order]);
    });
  });

  describe('removeOrder', () => {
    it('should remove an order from localStorage by ID', () => {
      const orders: Order[] = [
        { id: '1' } as Order,
        { id: '2' } as Order
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

      removeOrder('1');

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      expect(stored).toEqual([{ id: '2' }]);
    });
  });

  describe('onOrderChange', () => {
    it('should trigger callback on storage events', () => {
      const callback = mock(() => {});
      onOrderChange(callback);

      const orders: Order[] = [{ id: '1' } as Order];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

      const storageEvent = new (global as any).StorageEvent('storage', {
        key: STORAGE_KEY,
        newValue: JSON.stringify(orders)
      });
      window.dispatchEvent(storageEvent);

      expect(callback).toHaveBeenCalledWith(orders);
    });

    it('should trigger callback on fd-order-change events', () => {
      const callback = mock(() => {});
      onOrderChange(callback);

      const orders: Order[] = [{ id: '1' } as Order];
      const customEvent = new (global as any).CustomEvent('fd-order-change', { detail: orders });
      window.dispatchEvent(customEvent);

      expect(callback).toHaveBeenCalledWith(orders);
    });

    it('should return an unsubscribe function that removes listeners', () => {
      const addSpy = mock(window.addEventListener);
      const removeSpy = mock(window.removeEventListener);
      window.addEventListener = addSpy;
      window.removeEventListener = removeSpy;

      const unsubscribe = onOrderChange(() => {});
      expect(addSpy).toHaveBeenCalled();

      unsubscribe();
      expect(removeSpy).toHaveBeenCalled();
    });
  });
});
