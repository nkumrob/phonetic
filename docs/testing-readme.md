# Testing Guide

This project follows Test-Driven Development (TDD) principles. All new features and bug fixes should include appropriate tests.

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- unified-quiz.test.tsx

# Run tests in debug mode
npm run test:debug
```

## Test Structure

```
__tests__/
├── components/        # Component tests
├── hooks/            # Custom hook tests
├── integration/      # Integration tests
├── e2e/             # End-to-end tests
├── templates/       # Test templates
└── utils/           # Test utilities
```

## Writing Tests

### 1. Component Tests

Use the component test template as a starting point:

```typescript
import { renderWithProviders, screen, userEvent } from '@/tests/utils/test-utils';
import { YourComponent } from '@/components/your-component';

describe('YourComponent', () => {
  it('should render correctly', () => {
    renderWithProviders(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### 2. Hook Tests

```typescript
import { renderHook, act } from '@testing-library/react';
import { useYourHook } from '@/lib/hooks/use-your-hook';

describe('useYourHook', () => {
  it('should return initial value', () => {
    const { result } = renderHook(() => useYourHook());
    expect(result.current.value).toBe('initial');
  });
});
```

### 3. Integration Tests

Test complete user journeys across multiple components:

```typescript
describe('Feature Integration', () => {
  it('should complete user journey', async () => {
    const { user } = renderWithProviders(<App />);
    
    // Navigate to feature
    await user.click(screen.getByRole('link', { name: /feature/i }));
    
    // Complete workflow
    await user.type(screen.getByLabelText(/name/i), 'Test User');
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    // Verify outcome
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
```

## TDD Workflow

1. **Write a failing test first (RED)**
   ```typescript
   it('should add new feature', () => {
     // Test for feature that doesn't exist yet
     expect(screen.getByText('New Feature')).toBeInTheDocument();
   });
   ```

2. **Write minimal code to pass (GREEN)**
   ```typescript
   // Add just enough code to make the test pass
   return <div>New Feature</div>;
   ```

3. **Refactor while keeping tests green (REFACTOR)**
   ```typescript
   // Improve code quality without breaking tests
   return <Feature title="New Feature" />;
   ```

## Test Utilities

### Custom Render Function

The `renderWithProviders` function wraps components with necessary providers:

```typescript
const { user, ...renderResult } = renderWithProviders(<Component />);
```

### Mock Builders

Use test data builders for consistent test data:

```typescript
const mockQuestion = buildQuizQuestion({ 
  correctAnswer: 'Alpha' 
});
```

### Common Assertions

```typescript
// Check quiz is in progress
expectQuizInProgress();

// Check quiz completed
expectQuizCompleted();

// Check accessibility
await checkA11y(container);
```

## Coverage Requirements

- Minimum 80% coverage for all metrics
- New features must include tests
- Bug fixes must include regression tests

## Debugging Tests

### VS Code Debugging

1. Add breakpoint in test
2. Run: `npm run test:debug`
3. Attach VS Code debugger

### Console Logging

Use the debug utility:

```typescript
logTestState('Before interaction');
// ... perform action
logTestState('After interaction');
```

Set `DEBUG_TESTS=true` to enable debug logs.

## Best Practices

1. **Test behavior, not implementation**
   - ✅ `expect(screen.getByText('Success')).toBeInTheDocument()`
   - ❌ `expect(component.state.isSuccess).toBe(true)`

2. **Use semantic queries**
   - ✅ `screen.getByRole('button', { name: /submit/i })`
   - ❌ `screen.getByClassName('submit-btn')`

3. **Test user interactions**
   - ✅ `await user.click(submitButton)`
   - ❌ `submitButton.props.onClick()`

4. **Avoid implementation details**
   - ✅ Test what users see and do
   - ❌ Test internal state or methods

5. **Keep tests focused**
   - One concept per test
   - Clear test names
   - Arrange-Act-Assert pattern

## Common Testing Patterns

### Async Testing

```typescript
// Wait for elements
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Test loading states
expect(screen.getByText('Loading...')).toBeInTheDocument();
await waitFor(() => {
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});
```

### Error Testing

```typescript
// Test error handling
global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

await user.click(submitButton);

expect(screen.getByRole('alert')).toHaveTextContent('Error occurred');
```

### Timer Testing

```typescript
jest.useFakeTimers();

// Trigger timer-based action
await user.click(startButton);

// Advance time
jest.advanceTimersByTime(5000);

// Verify timer effect
expect(screen.getByText('5s')).toBeInTheDocument();

jest.useRealTimers();
```

## Continuous Integration

Tests run automatically on:
- Every push to main/develop branches
- Every pull request
- Can be run manually via GitHub Actions

Failed tests will block merges to protect code quality.

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**
   - Check import paths match tsconfig paths
   - Ensure jest.config.js moduleNameMapper is correct

2. **"Invalid hook call" errors**
   - Ensure hooks are only called in components/custom hooks
   - Check for conditional hook calls

3. **Timeout errors**
   - Increase timeout for slow operations: `{ timeout: 5000 }`
   - Check for missing async/await

4. **Flaky tests**
   - Use `waitFor` instead of fixed delays
   - Mock external dependencies
   - Ensure proper cleanup between tests

## Resources

- [Testing Library Docs](https://testing-library.com/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [TDD Best Practices](./test-driven-development.md)
- [Example TDD Workflow](./tdd-example-pause-quiz.md)