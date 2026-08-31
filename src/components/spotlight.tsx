import { useEffect } from "react";

/** Lumière douce qui suit la souris (variables CSS --spot-x/--spot-y). */
export function Spotlight() {
  useEffect(() => {
    const move = (e: PointerEvent) => {
      document.documentElement.style.setProperty("--spot-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--spot-y", `${e.clientY}px`);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return <div className="cursor-spotlight" aria-hidden="true" />;
}
