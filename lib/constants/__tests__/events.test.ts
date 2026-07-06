import { EVENT_NAMES, isEventName } from '../events';

describe('event constants', () => {
  it('allows exactly the five spec event names', () => {
    expect(EVENT_NAMES).toEqual([
      'page_view',
      'converter_use',
      'practice_session',
      'template_use',
      'time_saved_vote',
    ]);
  });

  it('isEventName accepts allowlisted names and rejects everything else', () => {
    expect(isEventName('page_view')).toBe(true);
    expect(isEventName('drop_table')).toBe(false);
    expect(isEventName(42)).toBe(false);
    expect(isEventName(undefined)).toBe(false);
  });
});
