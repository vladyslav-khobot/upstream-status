const TICK_MS = 30_000;

const listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | undefined;

/**
 * One shared timer for every <RelativeTime>, instead of one interval per element:
 * the incident history alone can render hundreds of them.
 */
export const onTick = (listener: () => void) => {
  listeners.add(listener);
  intervalId ??= setInterval(() => {
    listeners.forEach((notify) => {
      notify();
    });
  }, TICK_MS);
};
