import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LiveCodingWorkbench from '../components/LiveCodingWorkbench';

describe('LiveCodingWorkbench Component', () => {
  it('renders heading, language select, difficulty select, and generate button', () => {
    render(<LiveCodingWorkbench />);

    expect(screen.getByRole('heading', { level: 1, name: /live coding arena/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/programming language/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/problem difficulty/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate new challenge/i })).toBeInTheDocument();
  });

  it('allows changing language and difficulty', () => {
    render(<LiveCodingWorkbench />);

    const langSelect = screen.getByLabelText(/programming language/i) as HTMLSelectElement;
    fireEvent.change(langSelect, { target: { value: 'python' } });
    expect(langSelect.value).toBe('python');

    const diffSelect = screen.getByLabelText(/problem difficulty/i) as HTMLSelectElement;
    fireEvent.change(diffSelect, { target: { value: 'Hard' } });
    expect(diffSelect.value).toBe('Hard');
  });

  it('renders initial empty state with call to action', () => {
    render(<LiveCodingWorkbench />);

    expect(screen.getByText(/ready to test your algorithms\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate first problem/i })).toBeInTheDocument();
  });
});
