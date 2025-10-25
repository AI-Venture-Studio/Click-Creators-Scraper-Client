import { useEffect, useRef } from 'react';

/**
 * Hook to manage page-specific state reset on navigation
 * 
 * This hook helps ensure that when a user navigates away from a page,
 * all page-specific state is properly cleaned up to prevent data
 * from carrying over or flashing when navigating back.
 * 
 * @example
 * ```tsx
 * function MyPage() {
 *   const [data, setData] = useState([]);
 *   const [loading, setLoading] = useState(false);
 *   
 *   usePageReset(() => {
 *     // Reset all page-specific state when navigating away
 *     setData([]);
 *     setLoading(false);
 *   });
 *   
 *   // ... rest of component
 * }
 * ```
 */
export function usePageReset(resetCallback: () => void) {
  const callbackRef = useRef(resetCallback);

  // Keep the callback ref up to date
  useEffect(() => {
    callbackRef.current = resetCallback;
  }, [resetCallback]);

  // Run cleanup on unmount
  useEffect(() => {
    return () => {
      callbackRef.current();
    };
  }, []);
}

/**
 * Hook to reset state when a specific dependency changes (e.g., route params, job ID)
 * 
 * This is useful when you want to reset state not just on unmount,
 * but also when key dependencies change (like switching between jobs).
 * 
 * @example
 * ```tsx
 * function Dashboard() {
 *   const [data, setData] = useState([]);
 *   const jobId = searchParams.get('job');
 *   
 *   useResetOnChange(jobId, () => {
 *     // Reset state when job ID changes
 *     setData([]);
 *   });
 *   
 *   // ... rest of component
 * }
 * ```
 */
export function useResetOnChange<T>(
  dependency: T,
  resetCallback: () => void,
  options?: { skipInitial?: boolean }
) {
  const callbackRef = useRef(resetCallback);
  const isInitialMount = useRef(true);

  // Keep the callback ref up to date
  useEffect(() => {
    callbackRef.current = resetCallback;
  }, [resetCallback]);

  // Reset when dependency changes
  useEffect(() => {
    if (options?.skipInitial && isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    callbackRef.current();
  }, [dependency, options?.skipInitial]);

  // Also reset on unmount
  useEffect(() => {
    return () => {
      callbackRef.current();
    };
  }, []);
}
