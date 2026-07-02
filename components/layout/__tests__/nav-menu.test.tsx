import { render, screen, fireEvent } from '@testing-library/react';
import { NavDropdown } from '../nav-menu';

const ITEMS = [
  { name: 'AI Prompt Improver', href: '/tools/prompt-improver', emoji: '✨' },
  { name: 'All tools', href: '/tools', emoji: '🧰' },
];

describe('NavDropdown', () => {
  it('opens on click and lists items with hrefs', () => {
    render(<NavDropdown label="Tools" items={ITEMS} />);
    const trigger = screen.getByRole('button', { name: /tools/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: /prompt improver/i })).toHaveAttribute(
      'href',
      '/tools/prompt-improver'
    );
  });

  it('closes on Escape', () => {
    render(<NavDropdown label="Tools" items={ITEMS} />);
    fireEvent.click(screen.getByRole('button', { name: /tools/i }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('button', { name: /tools/i })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('invokes onNavigate and closes when an item is clicked', () => {
    const onNavigate = jest.fn();
    render(<NavDropdown label="Tools" items={ITEMS} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole('button', { name: /tools/i }));
    fireEvent.click(screen.getByRole('link', { name: /all tools/i }));
    expect(onNavigate).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /tools/i })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });
});
