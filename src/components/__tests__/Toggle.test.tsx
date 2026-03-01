import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toggle from '../common/Toggle';

describe('Toggle component', () => {
  it('renders with correct aria-checked attribute when checked', () => {
    render(<Toggle checked={true} onChange={() => {}} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('renders with correct aria-checked attribute when unchecked', () => {
    render(<Toggle checked={false} onChange={() => {}} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange with opposite value when clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} />);

    await user.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does not call onChange when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} disabled={true} />);

    await user.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has disabled attribute when disabled prop is true', () => {
    render(<Toggle checked={false} onChange={() => {}} disabled={true} />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });
});
