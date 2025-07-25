# Test-Driven Development (TDD) Guidelines

## Overview
This document establishes the Test-Driven Development practices for the Phonetic Alphabet project going forward. All new features and bug fixes should follow the TDD cycle: Red → Green → Refactor.

## TDD Workflow

### 1. Red Phase (Write Failing Test)
- Write a test for the new functionality BEFORE writing any implementation code
- The test should fail initially (red)
- Test should be specific and focused on one behavior

### 2. Green Phase (Make Test Pass)
- Write the minimal code necessary to make the test pass
- Don't worry about perfect code at this stage
- Focus only on making the test green

### 3. Refactor Phase (Improve Code)
- Clean up the implementation
- Remove duplication
- Improve naming and structure
- Ensure all tests still pass

## Project Test Structure

```
__tests__/
├── components/          # Component tests
│   ├── quiz/           # Quiz-related component tests
│   ├── gamification/   # Gamification component tests
│   └── ui/             # UI component tests
├── hooks/              # Custom hook tests
├── utils/              # Utility function tests
├── integration/        # Integration tests
└── e2e/               # End-to-end tests (future)
```

## Testing Standards

### 1. Test File Naming
- Unit tests: `[component-name].test.tsx`
- Integration tests: `[feature-name].integration.test.tsx`
- Hook tests: `use-[hook-name].test.ts`

### 2. Test Structure
```typescript
describe('ComponentName', () => {
  describe('Feature/Behavior', () => {
    it('should do something specific', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### 3. Coverage Requirements
- New code: Minimum 80% coverage
- Critical paths: 100% coverage
- UI Components: Focus on behavior, not implementation

## Example TDD Workflow

### Example: Adding a "Pause Quiz" Feature

#### Step 1: Write the Test First
```typescript
// __tests__/components/quiz/pause-quiz.test.tsx
describe('Quiz Pause Feature', () => {
  it('should show pause button during active quiz', () => {
    render(<UnifiedQuiz mode="practice" />);
    
    const pauseButton = screen.getByLabelText('Pause Quiz');
    expect(pauseButton).toBeInTheDocument();
  });

  it('should pause timer when pause button clicked', () => {
    render(<UnifiedQuiz mode="challenge" />);
    
    const pauseButton = screen.getByLabelText('Pause Quiz');
    fireEvent.click(pauseButton);
    
    // Timer should stop
    const timerBefore = screen.getByText(/\d+s/);
    act(() => jest.advanceTimersByTime(2000));
    const timerAfter = screen.getByText(/\d+s/);
    
    expect(timerBefore).toEqual(timerAfter);
  });

  it('should show paused overlay when quiz is paused', () => {
    render(<UnifiedQuiz mode="practice" />);
    
    const pauseButton = screen.getByLabelText('Pause Quiz');
    fireEvent.click(pauseButton);
    
    expect(screen.getByText('Quiz Paused')).toBeInTheDocument();
    expect(screen.getByText('Resume')).toBeInTheDocument();
  });
});
```

#### Step 2: Run Test (Should Fail)
```bash
npm test -- pause-quiz.test.tsx
# ❌ Tests fail - pause button doesn't exist yet
```

#### Step 3: Implement Minimal Code
```typescript
// Add pause button to UnifiedQuiz component
const [isPaused, setIsPaused] = useState(false);

// In render:
<button aria-label="Pause Quiz" onClick={() => setIsPaused(true)}>
  Pause
</button>

{isPaused && (
  <div>
    <h2>Quiz Paused</h2>
    <button onClick={() => setIsPaused(false)}>Resume</button>
  </div>
)}
```

#### Step 4: Run Test Again (Should Pass)
```bash
npm test -- pause-quiz.test.tsx
# ✅ Tests pass
```

#### Step 5: Refactor
- Extract pause logic to custom hook
- Improve UI/UX
- Add proper styling
- Ensure all tests still pass

## Test Utilities

### 1. Test Data Builders
Create builders for complex test data:

```typescript
// __tests__/builders/quiz-builder.ts
export const buildQuizQuestion = (overrides = {}) => ({
  id: 'test-1',
  type: 'letter-to-code',
  question: 'What is the phonetic code for "A"?',
  options: ['Alpha', 'Bravo', 'Charlie', 'Delta'],
  correctAnswer: 'Alpha',
  points: 10,
  ...overrides
});
```

### 2. Custom Render Functions
```typescript
// __tests__/utils/test-utils.tsx
export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <SessionProvider>
      {ui}
    </SessionProvider>
  );
};
```

### 3. Common Assertions
```typescript
// __tests__/utils/assertions.ts
export const expectQuizToBeInProgress = (container: HTMLElement) => {
  expect(screen.getByText(/Question \d+ of \d+/)).toBeInTheDocument();
  expect(screen.getByText(/What is the phonetic code/)).toBeInTheDocument();
};
```

## Testing Checklist for New Features

- [ ] Write user story/acceptance criteria
- [ ] Write failing integration test for the feature
- [ ] Write unit tests for individual components
- [ ] Implement code to pass tests
- [ ] Refactor while keeping tests green
- [ ] Add edge case tests
- [ ] Update documentation
- [ ] Run full test suite before committing

## Common Testing Patterns

### 1. Testing State Updates
```typescript
it('should update score when answer is correct', async () => {
  const { getByText } = render(<Quiz />);
  
  fireEvent.click(getByText('Alpha'));
  
  await waitFor(() => {
    expect(getByText('Score: 10')).toBeInTheDocument();
  });
});
```

### 2. Testing Async Operations
```typescript
it('should save progress after quiz completion', async () => {
  const mockSave = jest.fn();
  render(<Quiz onSave={mockSave} />);
  
  // Complete quiz...
  
  await waitFor(() => {
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        score: expect.any(Number),
        completed: true
      })
    );
  });
});
```

### 3. Testing User Interactions
```typescript
it('should handle rapid clicking without breaking', () => {
  const { getByRole } = render(<QuizButton />);
  const button = getByRole('button');
  
  // Rapid clicks
  fireEvent.click(button);
  fireEvent.click(button);
  fireEvent.click(button);
  
  // Should only register once
  expect(mockHandler).toHaveBeenCalledTimes(1);
});
```

## Running Tests

### Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- quiz-flow.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should calculate XP"
```

### Pre-commit Hook
Tests should run automatically before commits. If not set up:

```bash
# Install husky
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm test"
```

## Debugging Tests

### 1. Use debug()
```typescript
import { render, screen } from '@testing-library/react';

it('should show correct state', () => {
  render(<Component />);
  
  // Print current DOM
  screen.debug();
  
  // Print specific element
  screen.debug(screen.getByRole('button'));
});
```

### 2. Use logRoles()
```typescript
import { logRoles } from '@testing-library/react';

it('should have correct accessibility', () => {
  const { container } = render(<Component />);
  
  // Shows all ARIA roles
  logRoles(container);
});
```

### 3. Pause Test Execution
```typescript
it('should work correctly', async () => {
  render(<Component />);
  
  // Pause here in debugger
  debugger;
  
  fireEvent.click(screen.getByRole('button'));
});
```

## Best Practices

### DO ✅
- Write tests first
- Test behavior, not implementation
- Keep tests simple and focused
- Use descriptive test names
- Test edge cases
- Mock external dependencies
- Use data-testid sparingly

### DON'T ❌
- Test implementation details
- Make tests dependent on each other
- Use arbitrary wait times
- Test third-party libraries
- Write tests after implementation (except for bugs)
- Ignore failing tests

## Measuring Success

### Metrics to Track
1. **Test Coverage**: Aim for >80% overall
2. **Test Execution Time**: Keep under 5 minutes
3. **Test Reliability**: No flaky tests
4. **Bug Prevention**: Reduce production bugs by 50%

### Review Process
- All PRs must include tests
- Tests must pass in CI/CD
- Coverage must not decrease
- New features require test plan

## Resources

### Documentation
- [Testing Library Docs](https://testing-library.com/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Example Test Files
- `/Users/robertappiah/Documents/phoneticsweb/__tests__/quiz-flow-regression.test.tsx` - Comprehensive integration test
- `/Users/robertappiah/Documents/phoneticsweb/__tests__/quiz-accuracy.test.tsx` - State management tests
- `/Users/robertappiah/Documents/phoneticsweb/__tests__/quiz-comprehensive.test.tsx` - Feature coverage tests

## Next Steps

1. Set up pre-commit hooks for test execution
2. Add test coverage badges to README
3. Create test templates for common scenarios
4. Set up continuous integration with test reports
5. Schedule regular test review sessions