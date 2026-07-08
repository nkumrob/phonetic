import { render, screen, fireEvent } from '@testing-library/react';
import { AccountMenu } from '../account-menu';

describe('AccountMenu', () => {
  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('renders a single trigger and opens the menu with progress and settings links', () => {
    render(<AccountMenu />);

    const trigger = screen.getByRole('button', { name: /account/i });
    fireEvent.click(trigger);

    expect(screen.getByRole('link', { name: /your progress/i })).toHaveAttribute('href', '/profile');
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/settings');
  });

  it('shows the user name on the trigger when set', () => {
    render(<AccountMenu userName="Robert" />);
    expect(screen.getByRole('button', { name: /robert/i })).toBeInTheDocument();
  });

  it('switches theme inline without closing the menu', () => {
    render(<AccountMenu />);
    fireEvent.click(screen.getByRole('button', { name: /account/i }));

    fireEvent.click(screen.getByRole('button', { name: /^dark$/i }));

    expect(window.localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(screen.getByRole('link', { name: /your progress/i })).toBeInTheDocument(); // still open
  });

  it('closes on escape and calls onNavigate when a link is clicked', () => {
    const onNavigate = jest.fn();
    render(<AccountMenu onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: /account/i }));
    fireEvent.click(screen.getByRole('link', { name: /your progress/i }));
    expect(onNavigate).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /account/i }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('link', { name: /your progress/i })).not.toBeInTheDocument();
  });
});
