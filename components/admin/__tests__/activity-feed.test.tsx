import { render, screen } from '@testing-library/react';
import { ActivityFeed } from '../activity-feed';
import type { ActivityItem } from '@/lib/db/analytics/activity';

const makeItem = (overrides: Partial<ActivityItem> = {}): ActivityItem => ({
  at: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 minutes ago
  kind: 'ai',
  name: 'phonetic-ai',
  tool: 'phonetic-ai',
  anonShort: 'abc12345',
  country: 'US',
  ...overrides,
});

describe('ActivityFeed', () => {
  it('renders "No activity yet." when items is empty', () => {
    render(<ActivityFeed items={[]} />);
    expect(screen.getByText('No activity yet.')).toBeInTheDocument();
  });

  it('renders a relative time containing "ago"', () => {
    render(<ActivityFeed items={[makeItem()]} />);
    expect(screen.getByText(/ago/)).toBeInTheDocument();
  });

  it('renders the kind badge text', () => {
    render(<ActivityFeed items={[makeItem({ kind: 'ai' })]} />);
    expect(screen.getByText('ai')).toBeInTheDocument();
  });

  it('renders event kind badge', () => {
    render(<ActivityFeed items={[makeItem({ kind: 'event', name: 'page_view' })]} />);
    expect(screen.getByText('event')).toBeInTheDocument();
  });

  it('renders the tool name', () => {
    render(<ActivityFeed items={[makeItem({ tool: 'converter' })]} />);
    expect(screen.getByText('converter')).toBeInTheDocument();
  });

  it('renders — for null tool', () => {
    render(<ActivityFeed items={[makeItem({ tool: null, anonShort: null, country: null })]} />);
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(3);
  });

  it('renders anonShort in mono column', () => {
    render(<ActivityFeed items={[makeItem({ anonShort: 'deadbeef' })]} />);
    expect(screen.getByText('deadbeef')).toBeInTheDocument();
  });

  it('renders country', () => {
    render(<ActivityFeed items={[makeItem({ country: 'GB' })]} />);
    expect(screen.getByText('GB')).toBeInTheDocument();
  });

  it('renders multiple items', () => {
    const items = [
      makeItem({ kind: 'ai', tool: 'tool-a', anonShort: 'aaaa1111', country: 'US' }),
      makeItem({ kind: 'event', tool: 'tool-b', anonShort: 'bbbb2222', country: 'CA' }),
    ];
    render(<ActivityFeed items={items} />);
    expect(screen.getByText('tool-a')).toBeInTheDocument();
    expect(screen.getByText('tool-b')).toBeInTheDocument();
    expect(screen.getByText('US')).toBeInTheDocument();
    expect(screen.getByText('CA')).toBeInTheDocument();
  });
});
