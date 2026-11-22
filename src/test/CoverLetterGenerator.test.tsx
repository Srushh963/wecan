import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CoverLetterGenerator from '../components/CoverLetterGenerator';

describe('CoverLetterGenerator Component', () => {
  it('renders cover letter form inputs and labels', () => {
    render(<CoverLetterGenerator />);

    expect(screen.getByRole('heading', { level: 1, name: /ai cover letter architect/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/target company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
  });

  it('allows user to type into inputs and change tone', () => {
    render(<CoverLetterGenerator />);

    const roleInput = screen.getByLabelText(/job title/i) as HTMLInputElement;
    fireEvent.change(roleInput, { target: { value: 'Frontend Architect' } });
    expect(roleInput.value).toBe('Frontend Architect');

    const companyInput = screen.getByLabelText(/target company/i) as HTMLInputElement;
    fireEvent.change(companyInput, { target: { value: 'Vercel' } });
    expect(companyInput.value).toBe('Vercel');

    const techToneButton = screen.getByRole('button', { name: /technical/i });
    fireEvent.click(techToneButton);
    expect(techToneButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('displays generate button with disabled state when inputs are empty', () => {
    render(<CoverLetterGenerator />);

    const generateBtn = screen.getByRole('button', { name: /generate cover letter/i });
    expect(generateBtn).toBeInTheDocument();
    expect(generateBtn).toBeDisabled();
  });
});
