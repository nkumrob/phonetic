import { render, screen, fireEvent } from '@testing-library/react';
import { RangeSwitcher } from '../range-switcher';

describe('RangeSwitcher', () => {
  it('marks the active range and reports changes', () => {
    const onChange = jest.fn();
    render(<RangeSwitcher value={30} onChange={onChange} />);

    expect(screen.getByRole('button', { name: '30d' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: '90d' }));
    expect(onChange).toHaveBeenCalledWith(90);
  });
});
