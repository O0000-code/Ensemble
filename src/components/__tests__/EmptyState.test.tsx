import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { EmptyState } from '../common/EmptyState';

describe('EmptyState component', () => {
  const defaultIcon = React.createElement('svg', { 'data-testid': 'icon' });

  it('renders title', () => {
    render(<EmptyState icon={defaultIcon} title="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(<EmptyState icon={defaultIcon} title="Empty" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState icon={defaultIcon} title="Empty" description="Try adding some items" />);
    expect(screen.getByText('Try adding some items')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState icon={defaultIcon} title="Empty" />);
    // Only the title text, no paragraph for description
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(0);
  });

  it('renders action when provided', () => {
    const action = React.createElement('button', { 'data-testid': 'action-btn' }, 'Add Item');
    render(<EmptyState icon={defaultIcon} title="Empty" action={action} />);
    expect(screen.getByTestId('action-btn')).toBeInTheDocument();
    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });

  it('does not render action section when no action provided', () => {
    const { container } = render(<EmptyState icon={defaultIcon} title="Empty" />);
    // No action button
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(0);
  });
});
