/**
 * TemplateStrip tests — jsdom environment (default).
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateStrip } from '../template-strip';
import { type ToolTemplate } from '@/lib/ai/templates';

const SAMPLES: ToolTemplate[] = [
  { label: 'Template one', input: 'First input value that is at least twenty chars' },
  { label: 'Template two', input: 'Second input value that is at least twenty chars' },
];

describe('TemplateStrip', () => {
  it('returns null when templates array is empty', () => {
    const { container } = render(
      <TemplateStrip templates={[]} onSelect={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the hint text and all template labels', () => {
    render(<TemplateStrip templates={SAMPLES} onSelect={() => {}} />);
    expect(screen.getByText('Start from an example:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Template one' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Template two' })).toBeInTheDocument();
  });

  it('calls onSelect with the template input when a button is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(<TemplateStrip templates={SAMPLES} onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: 'Template one' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(SAMPLES[0].input);
  });
});
