import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../common/Badge';

describe('Badge component', () => {
  it('renders children text', () => {
    render(<Badge variant="count">42</Badge>);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders status variant with dot indicator', () => {
    const { container } = render(<Badge variant="status">Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
    // Status variant shows a dot by default
    const dots = container.querySelectorAll('.rounded-full');
    expect(dots.length).toBeGreaterThan(0);
  });

  it('renders count variant without dot', () => {
    const { container } = render(<Badge variant="count">5</Badge>);
    expect(screen.getByText('5')).toBeInTheDocument();
    // Count variant does not show a dot
    const dots = container.querySelectorAll('.rounded-full');
    expect(dots.length).toBe(0);
  });

  it('renders category variant with color dot', () => {
    const { container } = render(
      <Badge variant="category" color="#8B5CF6">
        Design
      </Badge>,
    );
    expect(screen.getByText('Design')).toBeInTheDocument();
    // Category with color shows a dot
    const dot = container.querySelector('.rounded-full');
    expect(dot).not.toBeNull();
    expect((dot as HTMLElement).style.backgroundColor).toBe('rgb(139, 92, 246)');
  });

  it('renders tag variant with border styling', () => {
    const { container } = render(<Badge variant="tag">react</Badge>);
    expect(screen.getByText('react')).toBeInTheDocument();
    // Tag variant has border class
    const badge = container.querySelector('.border');
    expect(badge).not.toBeNull();
  });

  it('accepts additional className', () => {
    const { container } = render(
      <Badge variant="count" className="custom-class">
        7
      </Badge>,
    );
    const span = container.querySelector('.custom-class');
    expect(span).not.toBeNull();
  });

  it('respects showDot override', () => {
    const { container } = render(
      <Badge variant="status" showDot={false}>
        No Dot
      </Badge>,
    );
    // Explicitly disabled dot
    const dots = container.querySelectorAll('.rounded-full');
    expect(dots.length).toBe(0);
  });
});
