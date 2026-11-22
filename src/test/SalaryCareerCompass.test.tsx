import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SalaryCareerCompass from '../components/SalaryCareerCompass';

describe('SalaryCareerCompass Component', () => {
  it('renders heading, form controls, and explore button', () => {
    render(<SalaryCareerCompass />);

    expect(screen.getByRole('heading', { level: 1, name: /salary & career compass/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/target role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/market \/ location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/experience bracket/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /explore brackets/i })).toBeInTheDocument();
  });

  it('updates form values on user typing and selection', () => {
    render(<SalaryCareerCompass />);

    const roleInput = screen.getByLabelText(/target role/i) as HTMLInputElement;
    fireEvent.change(roleInput, { target: { value: 'DevOps & SRE Engineer' } });
    expect(roleInput.value).toBe('DevOps & SRE Engineer');

    const locInput = screen.getByLabelText(/market \/ location/i) as HTMLInputElement;
    fireEvent.change(locInput, { target: { value: 'San Francisco, CA' } });
    expect(locInput.value).toBe('San Francisco, CA');

    const expSelect = screen.getByLabelText(/experience bracket/i) as HTMLSelectElement;
    fireEvent.change(expSelect, { target: { value: 'Mid-Level (2-5 YOE)' } });
    expect(expSelect.value).toBe('Mid-Level (2-5 YOE)');
  });
});
