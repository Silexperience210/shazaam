import { useEffect, useMemo, useState } from "react";

/**
 * Effet « fenêtres qui explosent » au paiement : flash électrique,
 * onde de choc, et une pluie d'éclats orange qui s'éparpillent.
 */
export function PaymentExplosion({ trigger }: { trigger: boolean }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    setActive(true);
    const id = setTimeout(() => setActive(false), 1300);
    return () => clearTimeout(id);
  }, [trigger]);

  const shards = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: 28 }, (_, i) => {
      const angle = (i / 28) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const dist = 130 + Math.random() * 300;
      return {
        id: i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        size: 18 + Math.random() * 64,
        rotate: (Math.random() - 0.5) * 400,
        delay: Math.random() * 70,
      };
    });
  }, [active]);

  if (!active) return null;

  return (
    <>
      <div className="flash-bolt" />
      <div className="shockwave-ring" />
      <div className="shockwave-ring" style={{ animationDelay: "0.09s" }} />
      {shards.map((s) => (
        <div
          key={s.id}
          className="shard"
          style={{
            width: s.size,
            height: s.size * 0.72,
            left: "50%",
            top: "50%",
            clipPath: "polygon(0 0, 100% 12%, 86% 100%, 10% 88%)",
            transform: `translate(calc(-50% + ${s.x}px), calc(-50% + ${s.y}px)) rotate(${s.rotate}deg)`,
            animationDelay: `${s.delay}ms`,
          }}
        />
      ))}
    </>
  );
}
