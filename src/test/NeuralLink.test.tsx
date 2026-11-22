import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NeuralLink from '../components/NeuralLink';

describe('NeuralLink Component', () => {
  it('renders sign in heading, tabs, and input fields', () => {
    const handleSuccess = vi.fn();
    render(<NeuralLink onSuccess={handleSuccess} />);

    expect(screen.getByRole('heading', { level: 1, name: /sign in to wecan/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^email address$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it('switches between Sign In and Sign Up tabs', () => {
    const handleSuccess = vi.fn();
    render(<NeuralLink onSuccess={handleSuccess} />);

    const signUpTab = screen.getByRole('tab', { name: /sign up/i });
    fireEvent.click(signUpTab);

    expect(screen.getByRole('heading', { level: 1, name: /create an account/i })).toBeInTheDocument();
    expect(signUpTab).toHaveAttribute('aria-selected', 'true');
  });

  it('allows user to enter email and password credentials', () => {
    const handleSuccess = vi.fn();
    render(<NeuralLink onSuccess={handleSuccess} />);

    const emailInput = screen.getByLabelText(/^email address$/i) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'candidate@wecan.ai' } });
    expect(emailInput.value).toBe('candidate@wecan.ai');

    const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
    expect(passwordInput.value).toBe('SecurePass123!');
  });
});
