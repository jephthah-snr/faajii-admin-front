import { useEffect, useRef, useState } from "react";

export const useSticky = (offset = 0) => {
  const stickyRef = useRef(null);
  const sentinelRef = useRef(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const stuck = entry.boundingClientRect.top < offset;
        setIsStuck(!entry.isIntersecting && stuck);
      },
      {
        root: null,
        threshold: 1,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [offset]);

  return { stickyRef, sentinelRef, isStuck };
};
