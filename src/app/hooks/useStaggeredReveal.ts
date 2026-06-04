import { useEffect, useState } from 'react';

export function useStaggeredReveal(count: number, enabled: boolean, staggerMs = 120, startDelayMs = 0) {
  const [visibleCount, setVisibleCount] = useState(enabled ? 0 : count);

  useEffect(() => {
    if (!enabled || count === 0) {
      setVisibleCount(count);
      return;
    }

    setVisibleCount(0);
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let index = 0; index < count; index += 1) {
      timers.push(
        setTimeout(
          () => setVisibleCount(index + 1),
          startDelayMs + index * staggerMs,
        ),
      );
    }

    return () => timers.forEach(clearTimeout);
  }, [count, enabled, staggerMs, startDelayMs]);

  return visibleCount;
}
