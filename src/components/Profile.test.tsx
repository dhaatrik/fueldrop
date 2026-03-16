import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Profile from './Profile';
import { useAppContext } from '../context/AppContext';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mock the AppContext
vi.mock('../context/AppContext', () => ({
  useAppContext: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock matchMedia for framer-motion/lucide-react compatibility
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});


describe('Profile component', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
  };

  const mockAddNotification = vi.fn();
  const mockSetUser = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useAppContext as any).mockReturnValue({
      user: mockUser,
      setUser: mockSetUser,
      addNotification: mockAddNotification,
      logout: mockLogout,
    });

    // Reset navigator.share
    if ('share' in navigator) {
      delete (navigator as any).share;
    }
  });

  const renderProfile = () => {
    return render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
  };

  test('handles native share correctly when supported', async () => {
    // Setup navigator.share mock
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      value: shareMock,
      configurable: true,
      writable: true
    });

    renderProfile();

    // Find and click the share more button
    const shareMoreBtn = screen.getByRole('button', { name: /share more/i });
    fireEvent.click(shareMoreBtn);

    expect(shareMock).toHaveBeenCalledWith({
      title: 'FuelDrop',
      text: 'Join me on FuelDrop and get fuel delivered anywhere!',
      url: window.location.origin,
    });
  });

  test('handles share error (e.g. user aborted) gracefully without crashing', async () => {
    // Setup navigator.share mock to reject
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const shareMock = vi.fn().mockRejectedValue(new Error('AbortError'));

    Object.defineProperty(navigator, 'share', {
      value: shareMock,
      configurable: true,
      writable: true
    });

    renderProfile();

    // Find and click the share more button
    const shareMoreBtn = screen.getByRole('button', { name: /share more/i });

    // Clicking should not throw an unhandled exception
    fireEvent.click(shareMoreBtn);

    expect(shareMock).toHaveBeenCalled();

    // Wait for the promise rejection to be handled
    await waitFor(() => {
      // We expect the catch block to be hit silently (no unhandled rejections)
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});
