import { flushSync } from 'react-dom';

type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
};

/**
 * Run `update` inside a View Transition. With a click point the new look spreads out
 * in a circle from it; without one the page cross-fades. Falls back to an instant
 * change when motion is reduced or the browser has no View Transitions.
 */
export function withTransition(update: () => void, reduce: boolean, point?: { x: number; y: number }): void {
  const doc = document as ViewTransitionDoc;
  if (reduce || !doc.startViewTransition) {
    update();
    return;
  }
  const root = document.documentElement;
  if (point) root.classList.add('theme-reveal');
  const t = doc.startViewTransition(() => flushSync(update));
  if (point) {
    const { x, y } = point;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    void t.ready
      .then(() =>
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 700, easing: 'cubic-bezier(.2,.8,.2,1)', pseudoElement: '::view-transition-new(root)' }
        )
      )
      .catch(() => undefined);
  }
  void t.finished.finally(() => root.classList.remove('theme-reveal'));
}
