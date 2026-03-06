# Implementation Plan: Display Page UX Improvements

## Overview

This implementation plan enhances the display page with three key UX improvements: auto-show navigation panel when all players complete their actions, smooth phase transition animations, and a compact pre-game layout optimized for smaller displays. All features will be implemented in the existing `app/display/[gameId]/page.tsx` component using React state management and CSS transitions.

## Tasks

- [x] 1. Implement auto-show navigation panel logic
  - [x] 1.1 Add state management for auto-show functionality
    - Add `autoShowNav` state variable to track when panel should auto-expand
    - Add React effect to compute auto-show state based on submission counts
    - Ensure auto-show triggers when all players complete guessing or betting
    - _Requirements: 1.1, 1.2, 1.6_

  - [ ]\* 1.2 Write property test for auto-show on completion
    - **Property 1: Auto-show on completion**
    - **Validates: Requirements 1.1, 1.2**
    - Test that autoShowNav becomes true when submissions equal total players during guessing/betting phases

  - [x] 1.3 Update navigation panel rendering with auto-show support
    - Modify navigation panel visibility logic to include `autoShowNav` state
    - Add visual indicator (green ring) to distinguish auto-show from manual show
    - Add "All players ready" message when auto-expanded
    - Ensure manual toggle button remains functional regardless of auto-show state
    - _Requirements: 1.3, 1.5_

  - [ ]\* 1.4 Write property test for advance button visibility during auto-show
    - **Property 2: Advance button visibility during auto-show**
    - **Validates: Requirements 1.3**
    - Test that advance button is rendered and visible when autoShowNav is true

  - [x] 1.5 Implement auto-show reset on phase advance
    - Reset `autoShowNav` to false when advance button is clicked
    - Collapse navigation panel after phase transition completes
    - _Requirements: 1.4_

  - [ ]\* 1.6 Write property test for panel collapse after advance
    - **Property 3: Panel collapse after advance**
    - **Validates: Requirements 1.4**
    - Test that showNavigation becomes false after advance completes

  - [ ]\* 1.7 Write property test for manual toggle independence
    - **Property 4: Manual toggle independence**
    - **Validates: Requirements 1.5**
    - Test that manual toggle always changes visibility regardless of auto-show state

  - [ ]\* 1.8 Write unit tests for auto-show edge cases
    - Test zero players scenario
    - Test single player scenario
    - Test partial submission scenarios
    - Test auto-show during reveal phase (should not trigger)
    - _Requirements: 1.1, 1.2, 1.6_

- [ ] 2. Checkpoint - Verify auto-show functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Implement phase transition animations
  - [x] 3.1 Add transition state management
    - Add `isTransitioning` state variable to track animation state
    - Add `previousPhase` state variable to detect phase changes
    - Add `contentKey` state variable to force re-renders during transitions
    - _Requirements: 2.1, 2.2, 2.3, 2.8_

  - [x] 3.2 Create CSS transition styles
    - Add phase-content transition classes for opacity and transform
    - Define exit animation (fade out, translate up, 200ms)
    - Define enter animation (fade in, translate down, 300ms)
    - Add reduced motion media query support for accessibility
    - _Requirements: 2.4, 2.5_

  - [ ]\* 3.3 Write property test for transition timing bounds
    - **Property 6: Transition timing bounds**
    - **Validates: Requirements 2.4**
    - Test that transition duration is between 300ms and 800ms

  - [x] 3.4 Implement transition coordination logic
    - Create `advancePhaseWithAnimation` function to orchestrate transitions
    - Implement exit animation delay (200ms)
    - Call existing `advancePhase` function during transition
    - Implement enter animation delay (300ms)
    - Reset transition state after completion
    - _Requirements: 2.1, 2.2, 2.3, 2.8_

  - [x] 3.5 Disable advance button during transitions
    - Update button disabled state to include `isTransitioning`
    - Add visual feedback for disabled state (cursor, opacity)
    - Prevent double-clicks and race conditions
    - _Requirements: 2.6_

  - [ ]\* 3.6 Write property test for button disabled during transition
    - **Property 7: Button disabled during transition**
    - **Validates: Requirements 2.6**
    - Test that advance button is disabled during all transition phases

  - [x] 3.7 Apply transition animations to content rendering
    - Wrap phase-specific content in transition container
    - Apply CSS classes based on transition state
    - Use contentKey to trigger re-renders on phase changes
    - _Requirements: 2.1, 2.2, 2.3, 2.7, 2.8_

  - [ ]\* 3.8 Write unit tests for transition state machine
    - Test idle → exit → api → enter → idle flow
    - Test timeout recovery if transition hangs
    - Test transition cancellation scenarios
    - _Requirements: 2.4, 2.6_

- [ ] 4. Checkpoint - Verify transition animations
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement compact pre-game display layout
  - [x] 5.1 Update pre-game heading with responsive sizing
    - Replace fixed text-6xl with clamp() function
    - Set maximum font size to 4rem
    - Use viewport-based scaling for fluid typography
    - _Requirements: 3.4, 3.6_

  - [ ]\* 5.2 Write property test for heading font size constraint
    - **Property 10: Heading font size constraint**
    - **Validates: Requirements 3.4**
    - Test that heading computed font size does not exceed 4rem

  - [x] 5.3 Update QR code with size constraints
    - Add max-w-[200px] and max-h-[200px] classes
    - Reduce default size from w-64 h-64 to w-40 h-40
    - Maintain aspect ratio and white background
    - _Requirements: 3.2_

  - [ ]\* 5.4 Write property test for QR code size constraint
    - **Property 8: QR code size constraint**
    - **Validates: Requirements 3.2**
    - Test that QR code dimensions do not exceed 200px × 200px

  - [x] 5.5 Update join code with responsive sizing
    - Replace fixed text-8xl with clamp() function
    - Set maximum font size to 6rem
    - Use viewport-based scaling for fluid typography
    - _Requirements: 3.3, 3.6_

  - [ ]\* 5.6 Write property test for join code font size constraint
    - **Property 9: Join code font size constraint**
    - **Validates: Requirements 3.3**
    - Test that join code computed font size does not exceed 6rem

  - [x] 5.7 Reduce vertical spacing throughout pre-game display
    - Reduce py-20 to py-8 for main container
    - Reduce mb-12 to mb-6 md:mb-8 for section spacing
    - Reduce mb-8 to mb-6 for QR code margin
    - Adjust button padding from py-6 to py-4
    - _Requirements: 3.1, 3.7_

  - [x] 5.8 Update player count and button text sizing
    - Reduce player count from text-3xl to text-xl md:text-2xl
    - Reduce button text from text-4xl to text-2xl md:text-3xl
    - Maintain readability while reducing overall size
    - _Requirements: 3.6_

  - [ ]\* 5.9 Write property test for viewport fit constraint
    - **Property 11: Viewport fit constraint**
    - **Validates: Requirements 3.5**
    - Test that pre-game content height does not exceed 1080px at 1920×1080 viewport

  - [ ]\* 5.10 Write unit tests for responsive sizing
    - Test size calculations at 1920×1080 viewport
    - Test size calculations at 1280×720 viewport
    - Test clamp() function behavior at various viewport widths
    - _Requirements: 3.5, 3.6, 3.7_

- [ ] 6. Checkpoint - Verify compact pre-game layout
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Add submission count display enhancement
  - [ ] 7.1 Verify submission count display in header
    - Confirm existing implementation shows "X/Y guessed" and "X/Y bet"
    - Ensure display updates in real-time via useGameChannel hook
    - Verify visibility only during guessing and betting phases
    - _Requirements: 1.7_

  - [ ]\* 7.2 Write property test for submission count display
    - **Property 5: Submission count display**
    - **Validates: Requirements 1.7**
    - Test that rendered text matches format "X/Y guessed" or "X/Y bet"

  - [ ]\* 7.3 Write unit tests for submission count edge cases
    - Test display with zero players
    - Test display with single player
    - Test display during reveal phase (should not show)
    - Test display format with various player counts
    - _Requirements: 1.7_

- [ ] 8. Integration and accessibility improvements
  - [ ] 8.1 Add ARIA live regions for screen readers
    - Add aria-live region for auto-show announcements
    - Add aria-live region for phase transition announcements
    - Add aria-label to navigation toggle button
    - Ensure advance button has descriptive aria-label

  - [ ] 8.2 Implement keyboard navigation support
    - Ensure advance button remains keyboard accessible during auto-show
    - Add Escape key handler to close auto-shown panel
    - Maintain focus on advance button during transitions

  - [ ] 8.3 Add visual indicators for transition states
    - Show loading spinner or animation during transitions
    - Update button text during transition phases
    - Ensure high contrast for all text on gradient backgrounds

  - [ ]\* 8.4 Write integration tests for complete flows
    - Test complete game flow with auto-show: start → all guess → auto-show → advance → collapse
    - Test manual override: auto-show → manual close → stays closed
    - Test phase transitions through complete game cycle
    - Test pre-game display on various screen sizes

- [ ] 9. Final checkpoint - Complete testing and validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All implementation occurs in `app/display/[gameId]/page.tsx`
- No new dependencies required - using React + CSS only
- Property tests use fast-check library with minimum 100 iterations
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- Auto-show logic leverages existing submission count tracking
- Transitions use CSS for performance with JavaScript coordination
- Responsive sizing uses clamp() for fluid typography without breakpoint jumps
