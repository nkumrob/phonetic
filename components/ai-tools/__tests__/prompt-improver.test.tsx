import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptImprover } from '../prompt-improver';

function mockFetchSequence(
  ...responses: Array<{ ok: boolean; body: unknown }>
): jest.Mock {
  const fetchMock = jest.fn();
  for (const { ok, body } of responses) {
    fetchMock.mockResolvedValueOnce({ ok, json: async () => body });
  }
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

const SUCCESS = {
  ok: true,
  body: { result: { output: 'Role: web developer\n\nTask: build a website', usageId: 'uuid-1' } },
};

describe('PromptImprover', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders the textarea and disables submit while empty', () => {
    render(<PromptImprover />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /improve my prompt/i })).toBeDisabled();
  });

  it('shows a character counter that tracks input', async () => {
    render(<PromptImprover />);
    const user = userEvent.setup();

    await user.type(screen.getByRole('textbox'), 'hello');

    expect(screen.getByText(/5\s*\/\s*2,?000/)).toBeInTheDocument();
  });

  it('submits input and renders the improved prompt', async () => {
    const fetchMock = mockFetchSequence(SUCCESS);
    render(<PromptImprover />);
    const user = userEvent.setup();

    await user.type(screen.getByRole('textbox'), 'make me a website');
    await user.click(screen.getByRole('button', { name: /improve my prompt/i }));

    await waitFor(() =>
      expect(screen.getByText(/Role: web developer/)).toBeInTheDocument()
    );
    expect(fetchMock).toHaveBeenCalledWith('/api/ai/prompt-improver', expect.anything());
  });

  it('shows the server error in an alert on failure', async () => {
    mockFetchSequence({ ok: false, body: { error: 'AI service is not configured' } });
    render(<PromptImprover />);
    const user = userEvent.setup();

    await user.type(screen.getByRole('textbox'), 'make me a website');
    await user.click(screen.getByRole('button', { name: /improve my prompt/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('AI service is not configured')
    );
  });

  it('copies the result and shows a temporary Copied state', async () => {
    mockFetchSequence(SUCCESS);
    render(<PromptImprover />);
    const user = userEvent.setup();

    await user.type(screen.getByRole('textbox'), 'make me a website');
    await user.click(screen.getByRole('button', { name: /improve my prompt/i }));
    await waitFor(() => screen.getByText(/Role: web developer/));

    await user.click(screen.getByRole('button', { name: /copy/i }));

    // userEvent.setup() stubs the clipboard API — read back what was written
    expect(await navigator.clipboard.readText()).toBe(
      'Role: web developer\n\nTask: build a website'
    );
    expect(await screen.findByText(/copied/i)).toBeInTheDocument();
  });

  it('shows time-saved pills after a result and posts the chosen bucket', async () => {
    const fetchMock = mockFetchSequence(SUCCESS, { ok: true, body: {} });
    render(<PromptImprover />);
    const user = userEvent.setup();

    await user.type(screen.getByRole('textbox'), 'make me a website');
    await user.click(screen.getByRole('button', { name: /improve my prompt/i }));
    await waitFor(() => screen.getByText(/Role: web developer/));

    await user.click(screen.getByRole('button', { name: /1-5 min/i }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/ai/feedback',
        expect.objectContaining({
          body: JSON.stringify({ usageId: 'uuid-1', timeSavedBucket: '1-5' }),
        })
      )
    );
    expect(await screen.findByText(/thanks/i)).toBeInTheDocument();
  });
});
