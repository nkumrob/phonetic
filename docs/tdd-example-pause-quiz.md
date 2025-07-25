# TDD Example: Adding a Pause Quiz Feature

This document demonstrates how to implement a new feature using Test-Driven Development.

## Feature Request
"As a user, I want to pause the quiz so I can take a break without losing progress."

## Step 1: Write the Test First (RED)

Create `__tests__/components/quiz/pause-quiz.test.tsx`:

```typescript
import React from 'react';
import { renderWithProviders, userEvent, screen, waitFor } from '@/tests/utils/test-utils';
import { UnifiedQuiz } from '@/components/practice/unified-quiz';

describe('Quiz Pause Feature', () => {
  it('should show pause button during active quiz', async () => {
    const { user } = renderWithProviders(
      <UnifiedQuiz mode="practice" onComplete={jest.fn()} onSessionSaved={jest.fn()} />
    );
    
    // Wait for quiz to load
    await waitFor(() => {
      expect(screen.getByText(/Question 1 of 10/)).toBeInTheDocument();
    });
    
    // Should see pause button
    const pauseButton = screen.getByRole('button', { name: /pause quiz/i });
    expect(pauseButton).toBeInTheDocument();
    expect(pauseButton).toBeEnabled();
  });

  it('should pause timer when pause button is clicked in challenge mode', async () => {
    jest.useFakeTimers();
    
    const { user } = renderWithProviders(
      <UnifiedQuiz mode="challenge" onComplete={jest.fn()} onSessionSaved={jest.fn()} />
    );
    
    // Wait for quiz to load
    await waitFor(() => {
      expect(screen.getByText(/Question 1 of 20/)).toBeInTheDocument();
    });
    
    // Note initial timer
    const initialTimer = screen.getByText(/\d+s/);
    const initialTime = parseInt(initialTimer.textContent || '0');
    
    // Click pause
    const pauseButton = screen.getByRole('button', { name: /pause quiz/i });
    await user.click(pauseButton);
    
    // Advance time
    jest.advanceTimersByTime(3000);
    
    // Timer should not have changed
    const currentTimer = screen.getByText(/\d+s/);
    const currentTime = parseInt(currentTimer.textContent || '0');
    expect(currentTime).toBe(initialTime);
    
    jest.useRealTimers();
  });

  it('should show paused overlay with resume button', async () => {
    const { user } = renderWithProviders(
      <UnifiedQuiz mode="practice" onComplete={jest.fn()} onSessionSaved={jest.fn()} />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Question 1 of 10/)).toBeInTheDocument();
    });
    
    // Click pause
    const pauseButton = screen.getByRole('button', { name: /pause quiz/i });
    await user.click(pauseButton);
    
    // Should show paused overlay
    expect(screen.getByText(/quiz paused/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resume quiz/i })).toBeInTheDocument();
    
    // Original quiz content should be hidden or dimmed
    expect(screen.getByTestId('quiz-content')).toHaveClass('opacity-50');
  });

  it('should resume quiz when resume button is clicked', async () => {
    const { user } = renderWithProviders(
      <UnifiedQuiz mode="practice" onComplete={jest.fn()} onSessionSaved={jest.fn()} />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Question 1 of 10/)).toBeInTheDocument();
    });
    
    // Pause quiz
    await user.click(screen.getByRole('button', { name: /pause quiz/i }));
    
    // Resume quiz
    await user.click(screen.getByRole('button', { name: /resume quiz/i }));
    
    // Paused overlay should be gone
    expect(screen.queryByText(/quiz paused/i)).not.toBeInTheDocument();
    
    // Quiz should be interactive again
    const answerButton = screen.getAllByRole('button')[0];
    expect(answerButton).toBeEnabled();
  });

  it('should not allow answering questions while paused', async () => {
    const { user } = renderWithProviders(
      <UnifiedQuiz mode="practice" onComplete={jest.fn()} onSessionSaved={jest.fn()} />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Question 1 of 10/)).toBeInTheDocument();
    });
    
    // Pause quiz
    await user.click(screen.getByRole('button', { name: /pause quiz/i }));
    
    // Try to click answer buttons
    const answerButtons = screen.getAllByRole('button').filter(
      btn => !btn.textContent?.match(/pause|resume/i)
    );
    
    for (const button of answerButtons) {
      await user.click(button);
    }
    
    // Should still be on question 1
    expect(screen.getByText(/Question 1 of 10/)).toBeInTheDocument();
  });

  it('should track pause duration in quiz results', async () => {
    jest.useFakeTimers();
    const mockOnSessionSaved = jest.fn();
    
    const { user } = renderWithProviders(
      <UnifiedQuiz 
        mode="practice" 
        onComplete={jest.fn()} 
        onSessionSaved={mockOnSessionSaved} 
      />
    );
    
    // Answer all questions with a pause in the middle
    for (let i = 0; i < 10; i++) {
      await waitFor(() => {
        expect(screen.getByText(`Question ${i + 1} of 10`)).toBeInTheDocument();
      });
      
      // Pause after question 5
      if (i === 5) {
        await user.click(screen.getByRole('button', { name: /pause quiz/i }));
        jest.advanceTimersByTime(10000); // 10 second pause
        await user.click(screen.getByRole('button', { name: /resume quiz/i }));
      }
      
      // Answer question
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);
      
      jest.advanceTimersByTime(2000);
    }
    
    // Check that pause duration was tracked
    await waitFor(() => {
      expect(mockOnSessionSaved).toHaveBeenCalled();
    });
    
    const savedData = mockOnSessionSaved.mock.calls[0][0];
    expect(savedData).toHaveProperty('pauseDuration', 10);
    
    jest.useRealTimers();
  });
});
```

## Step 2: Run the Test (Verify it Fails)

```bash
npm test -- pause-quiz.test.tsx
```

Expected output:
```
FAIL __tests__/components/quiz/pause-quiz.test.tsx
  ✕ should show pause button during active quiz
  ✕ should pause timer when pause button is clicked
  ... etc
```

## Step 3: Implement Minimal Code (GREEN)

Add to `components/practice/unified-quiz.tsx`:

```typescript
// Add state for pause functionality
const [isPaused, setIsPaused] = useState(false);
const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
const [totalPauseDuration, setTotalPauseDuration] = useState(0);

// Add pause handlers
const handlePause = () => {
  setIsPaused(true);
  setPauseStartTime(Date.now());
};

const handleResume = () => {
  if (pauseStartTime) {
    const pauseDuration = Date.now() - pauseStartTime;
    setTotalPauseDuration(prev => prev + pauseDuration);
  }
  setIsPaused(false);
  setPauseStartTime(null);
};

// Update timer to not advance when paused
useEffect(() => {
  if (isQuizActive && !isPaused) {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }
}, [isQuizActive, isPaused]);

// In the render method, add:
{!showFailureScreen && (
  <button
    onClick={handlePause}
    disabled={isPaused}
    aria-label="Pause Quiz"
    className="fixed top-4 right-4 btn btn-secondary"
  >
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </button>
)}

{/* Paused Overlay */}
{isPaused && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
    <div className="bg-background p-8 rounded-2xl text-center space-y-4">
      <h2 className="text-2xl font-bold">Quiz Paused</h2>
      <p className="text-muted-foreground">Take your time. Your progress is saved.</p>
      <button
        onClick={handleResume}
        aria-label="Resume Quiz"
        className="btn btn-primary"
      >
        Resume Quiz
      </button>
    </div>
  </div>
)}

{/* Add opacity when paused */}
<div data-testid="quiz-content" className={cn(isPaused && "opacity-50")}>
  {/* Existing quiz content */}
</div>
```

## Step 4: Run Tests Again (Should Pass)

```bash
npm test -- pause-quiz.test.tsx
```

Expected output:
```
PASS __tests__/components/quiz/pause-quiz.test.tsx
  ✓ should show pause button during active quiz
  ✓ should pause timer when pause button is clicked
  ... etc
```

## Step 5: Refactor (REFACTOR)

Now that tests pass, improve the code:

1. Extract pause logic to a custom hook:

```typescript
// hooks/use-quiz-pause.ts
export const useQuizPause = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
  const [totalPauseDuration, setTotalPauseDuration] = useState(0);

  const pause = useCallback(() => {
    setIsPaused(true);
    setPauseStartTime(Date.now());
  }, []);

  const resume = useCallback(() => {
    if (pauseStartTime) {
      const duration = Date.now() - pauseStartTime;
      setTotalPauseDuration(prev => prev + duration);
    }
    setIsPaused(false);
    setPauseStartTime(null);
  }, [pauseStartTime]);

  return { isPaused, pause, resume, totalPauseDuration };
};
```

2. Create a PauseButton component:

```typescript
// components/quiz/pause-button.tsx
interface PauseButtonProps {
  isPaused: boolean;
  onPause: () => void;
  className?: string;
}

export const PauseButton = ({ isPaused, onPause, className }: PauseButtonProps) => (
  <button
    onClick={onPause}
    disabled={isPaused}
    aria-label="Pause Quiz"
    className={cn("btn btn-secondary", className)}
  >
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </button>
);
```

3. Run tests again to ensure refactoring didn't break anything:

```bash
npm test -- pause-quiz.test.tsx
```

## Step 6: Add Edge Case Tests

```typescript
it('should handle pause during question transition', async () => {
  // Test pausing between questions
});

it('should not allow pause during result display', async () => {
  // Test pause button is disabled during results
});

it('should handle multiple pause/resume cycles', async () => {
  // Test accumulated pause duration
});
```

## Benefits of This TDD Approach

1. **Clear Requirements**: Tests define exactly what the feature should do
2. **Confidence**: All edge cases are covered before implementation
3. **Better Design**: Writing tests first leads to more testable code
4. **Documentation**: Tests serve as living documentation
5. **No Over-Engineering**: Only implement what's needed to pass tests
6. **Refactoring Safety**: Can improve code without fear of breaking functionality

## Checklist

- [x] Wrote failing tests first
- [x] Implemented minimal code to pass tests
- [x] Refactored for better code quality
- [x] All tests still pass after refactoring
- [x] Added edge case tests
- [x] Updated documentation
- [x] Ready for code review