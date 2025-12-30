import { useEffect, useRef } from "react";

export default function Reveal({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        el.classList.add("reveal-init");

        const obs = new IntersectionObserver(
            (entries) => {
                for (const e of entries) {
                    if (e.isIntersecting) {
                        el.classList.add("reveal-show");
                        obs.disconnect();
                    }
                }
            },
            { threshold: 0.12 }
        );

        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return <div ref={ref}>{children}</div>;
}
