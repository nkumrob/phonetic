import { render, screen } from '@testing-library/react';
import { ActivityFeed, relativeTime } from '../activity-feed';
import type { ActivityItem } from '@/lib/db/analytics/activity';

const makeItem = (overrides: Partial<ActivityItem> = {}): ActivityItem => ({
  at: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 minutes ago, ISO-Z format
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

describe('relativeTime — boundary conditions (ISO-Z inputs, fixed "now")', () => {
  // Fixed reference: 2026-07-06T12:00:00.000Z
  const NOW = new Date('2026-07-06T12:00:00.000Z').getTime();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns "0s ago" for timestamps equal to now', () => {
    expect(relativeTime('2026-07-06T12:00:00Z')).toBe('0s ago');
  });

  it('returns seconds label for < 60 s ago', () => {
    expect(relativeTime('2026-07-06T11:59:30Z')).toBe('30s ago');
    expect(relativeTime('2026-07-06T11:59:01Z')).toBe('59s ago');
  });

  it('returns minutes label at exactly 60 s ago', () => {
    expect(relativeTime('2026-07-06T11:59:00Z')).toBe('1m ago');
  });

  it('returns minutes label for < 60 min ago', () => {
    expect(relativeTime('2026-07-06T11:30:00Z')).toBe('30m ago');
    expect(relativeTime('2026-07-06T11:01:00Z')).toBe('59m ago');
  });

  it('returns hours label at exactly 60 min ago', () => {
    expect(relativeTime('2026-07-06T11:00:00Z')).toBe('1h ago');
  });

  it('returns hours label for < 24 h ago', () => {
    expect(relativeTime('2026-07-06T06:00:00Z')).toBe('6h ago');
    expect(relativeTime('2026-07-05T13:00:00Z')).toBe('23h ago');
  });

  it('returns days label at exactly 24 h ago', () => {
    expect(relativeTime('2026-07-05T12:00:00Z')).toBe('1d ago');
  });

  it('returns days label for older timestamps', () => {
    expect(relativeTime('2026-07-04T12:00:00Z')).toBe('2d ago');
    expect(relativeTime('2026-06-06T12:00:00Z')).toBe('30d ago');
  });
});
