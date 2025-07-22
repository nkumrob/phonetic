#!/bin/bash

echo "Removing gamification components and files..."

# Remove gamification component directory
echo "Removing gamification components..."
rm -rf components/gamification/

# Remove gamification-dependent components
echo "Removing achievements component..."
rm -f components/profile/achievements.tsx

# Remove gamification utilities
echo "Removing gamification utilities..."
rm -f lib/core/level-system.ts
rm -f lib/utils/xp-system.ts
rm -f lib/utils/xp-calculations.ts
rm -f lib/types/streaks.ts

# Remove old state management files
echo "Removing old state management..."
rm -f lib/state/unified-state-manager.ts
rm -f lib/state/migrations.ts
rm -f lib/state/migrate-v2.ts
rm -f lib/state/migrate-v3.ts
rm -f lib/state/types.ts

# Remove old context files
echo "Removing old contexts..."
rm -f lib/contexts/session-context.tsx
rm -f lib/contexts/unified-state-context.tsx

# Remove old hooks
echo "Removing old hooks..."
rm -f lib/hooks/use-unified-state.ts

# Remove test/debug pages
echo "Removing test pages..."
rm -rf app/debug-xp/
rm -rf app/test-quiz*/
rm -rf app/practice-simple/
rm -rf app/profile-simple/
rm -rf app/settings-simple/
rm -rf app/home-simple/

# Remove old components that were replaced
echo "Removing old components..."
rm -f components/practice/practice-hub-v2.tsx
rm -f components/practice/practice-hub.tsx
rm -f components/practice/unified-quiz.tsx
rm -f components/practice/adaptive-quiz.tsx
rm -f components/learning/enhanced-quiz.tsx
rm -f components/learning/enhanced-flashcards.tsx
rm -f components/learning/quiz-interface.tsx
rm -f components/layout/header.tsx
rm -f components/ui/save-indicator.tsx

# Remove old practice client
rm -f app/practice/practice-client.tsx

# Remove gamification-related test files
echo "Removing gamification tests..."
rm -rf __tests__/quiz-*
rm -rf __tests__/components/practice/unified-quiz.test.tsx

# Remove gamification documentation
echo "Removing gamification docs..."
rm -f docs/level-up-fixes-summary.md
rm -f docs/quiz-accuracy-fix-summary.md
rm -f docs/state-refactoring-plan.md
rm -f docs/implementation-roadmap.md
rm -f docs/phase1-implementation-plan.md
rm -f docs/gamification-critical-gaps.md

echo "Gamification removal complete!"