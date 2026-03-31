import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from './Login';
import { AppProvider } from '../context/AppContext';
import { BrowserRouter } from 'react-router-dom';

// Mock window.matchMedia as required by the project's testing guidelines
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

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock import.meta.env
vi.stubGlobal('import.meta', {
  env: {
    DEV: false, // Simulate production for testing security fix
  },
});

describe('Login Component Security Fix', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <AppProvider>
          <Login />
        </AppProvider>
      </BrowserRouter>
    );
  };

  it('should call fetch to verify OTP in "production" even for "1234"', async () => {
    renderLogin();

    // Enter phone number
    const phoneInput = screen.getByPlaceholderText(/Enter 10 digit number/i);
    fireEvent.change(phoneInput, { target: { value: '9876543210' } });

    // Check terms
    const termsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(termsCheckbox);

    // Click Get OTP
    const getOtpButton = screen.getByText(/Get OTP/i);
    fireEvent.click(getOtpButton);

    // Enter OTP "1234" (which was previously hardcoded)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('••••')).toBeInTheDocument();
    });
    const otpInput = screen.getByPlaceholderText('••••');
    fireEvent.change(otpInput, { target: { value: '1234' } });

    // Click Verify & Login
    const verifyButton = screen.getByText(/Verify & Login/i);
    fireEvent.click(verifyButton);

    // Should call fetch because DEV is false
    await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/verify-otp', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ phone: '9876543210', otp: '1234' }),
        }));
    });
  });

  it('should show error when API verification fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid OTP from server' }),
    });

    renderLogin();

    // Enter phone number
    const phoneInput = screen.getByPlaceholderText(/Enter 10 digit number/i);
    fireEvent.change(phoneInput, { target: { value: '9876543210' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText(/Get OTP/i));

    // Enter OTP
    await waitFor(() => {
      expect(screen.getByPlaceholderText('••••')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText('••••'), { target: { value: '5678' } });
    fireEvent.click(screen.getByText(/Verify & Login/i));

    // Should show error notification from API
    await waitFor(() => {
      expect(screen.getByText(/Invalid OTP from server/i)).toBeInTheDocument();
    });
  });
});
