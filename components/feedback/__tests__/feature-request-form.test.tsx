import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FeatureRequestForm } from '../feature-request-form';

const originalFetch = global.fetch;
afterEach(() => {
  global.fetch = originalFetch;
});

describe('FeatureRequestForm', () => {
  it('renders label "Your request"', () => {
    render(<FeatureRequestForm />);
    expect(screen.getByLabelText(/your request/i)).toBeInTheDocument();
  });

  it('renders label "Name"', () => {
    render(<FeatureRequestForm />);
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
  });

  it('renders label "Email"', () => {
    render(<FeatureRequestForm />);
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
  });

  it('valid submit: calls POST /api/feature-requests with correct body', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<FeatureRequestForm />);

    fireEvent.change(screen.getByLabelText(/your request/i), {
      target: { value: 'Please add dark mode to the dashboard' },
    });
    fireEvent.change(screen.getByLabelText(/^name$/i), {
      target: { value: 'Alice' },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: 'alice@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit request/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/feature-requests',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            request: 'Please add dark mode to the dashboard',
            name: 'Alice',
            email: 'alice@example.com',
          }),
        })
      );
    });
  });

  it('shows success message after successful fetch', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<FeatureRequestForm />);

    fireEvent.change(screen.getByLabelText(/your request/i), {
      target: { value: 'Please add dark mode to the dashboard' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit request/i }));

    expect(
      await screen.findByText(/got it\. thanks for helping shape the roadmap\./i)
    ).toBeInTheDocument();
  });

  it('"Submit another" appears after success and resets the form', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<FeatureRequestForm />);

    fireEvent.change(screen.getByLabelText(/your request/i), {
      target: { value: 'Add bulk export feature please' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit request/i }));

    const submitAnother = await screen.findByRole('button', { name: /submit another/i });
    expect(submitAnother).toBeInTheDocument();

    // Click "Submit another" — form should reset (textarea should appear again)
    fireEvent.click(submitAnother);
    expect(screen.getByLabelText(/your request/i)).toBeInTheDocument();
  });

  it('shows role=alert on server error', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Internal server error' }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<FeatureRequestForm />);

    fireEvent.change(screen.getByLabelText(/your request/i), {
      target: { value: 'Feature request that fails on server' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit request/i }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
