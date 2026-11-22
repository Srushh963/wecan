import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WarMap from '../components/WarMap';

vi.mock('../lib/soundManager', () => ({
  stopAllSpeechAndAudio: vi.fn(),
}));

describe('WarMap Navigation & Workspace Component', () => {
  const mockUser = {
    displayName: 'Test Candidate',
    email: 'candidate@wecan.ai',
  };

  it('renders application brand, navigation items, and candidate profile', () => {
    render(<WarMap user={mockUser} />);

    expect(screen.getByRole('heading', { level: 1, name: /wecan/i })).toBeInTheDocument();
    expect(screen.getByText('Test Candidate')).toBeInTheDocument();
    expect(screen.getByText('candidate@wecan.ai')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });

  it('renders all 11 modules in the navigation rail', () => {
    render(<WarMap user={mockUser} />);

    expect(screen.getByRole('button', { name: /1\. onboarding/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /2\. voice resume/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /3\. ats scan/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /4\. practice q&a/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /5\. written test/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /6\. coding arena/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /7\. mock interview/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /8\. cover letter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /9\. career & salary/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /10\. resource hub/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /11\. performance/i })).toBeInTheDocument();
  });

  it('updates current module header on click', () => {
    render(<WarMap user={mockUser} />);

    const codingButton = screen.getByRole('button', { name: /6\. coding arena/i });
    fireEvent.click(codingButton);

    expect(screen.getByRole('heading', { level: 2, name: /6\. coding arena/i })).toBeInTheDocument();
  });
});
