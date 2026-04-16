import React, { useEffect, useRef, useState } from "react";
import "../css/OfertasCarousel.css";

export default function Carousel({
    children,
    interval = 2000,
    showArrows = true,
    showIndicators = true,
    className = "",
}) {
    const [index, setIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timerRef = useRef(null);
    const containerRef = useRef(null);

    const total = React.Children.count(children);

    // autoplay
    useEffect(() => {
        if (isPaused || total <= 1) return;
        timerRef.current = setInterval(() => {
            setIndex((i) => (i + 1) % total);
        }, interval);
        return () => clearInterval(timerRef.current);
    }, [isPaused, total, interval]);

    // keyboard navigation
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [index, total]);

    // touch support
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        let startX = 0;

        const onTouchStart = (e) => (startX = e.touches[0].clientX);
        const onTouchEnd = (e) => {
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 40) {
                dx > 0 ? prev() : next();
            }
        };

        el.addEventListener("touchstart", onTouchStart);
        el.addEventListener("touchend", onTouchEnd);

        return () => {
            el.removeEventListener("touchstart", onTouchStart);
            el.removeEventListener("touchend", onTouchEnd);
        };
    }, [index, total]);

    const prev = () =>
        setIndex((i) => (i - 1 + total) % Math.max(total, 1));

    const next = () =>
        setIndex((i) => (i + 1) % total);

    if (!total) return null;

    return (
        <div
            className={`carousel ${className}`}
            ref={containerRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <ul
                className="carousel-track"
                style={{ transform: `translateX(-${index * 100}%)` }}
            >
                {React.Children.map(children, (child, i) => (
                    <li
                        className="carousel-slide"
                        key={i}
                        aria-hidden={i !== index}
                    >
                        {child}
                    </li>
                ))}
            </ul>

            {showArrows && total > 1 && (
                <>
                    <button className="carousel-arrow left" onClick={prev}>
                        ‹
                    </button>
                    <button className="carousel-arrow right" onClick={next}>
                        ›
                    </button>
                </>
            )}

            {showIndicators && total > 1 && (
                <div className="carousel-indicators">
                    {Array.from({ length: total }).map((_, i) => (
                        <button
                            key={i}
                            className={i === index ? "indicator active" : "indicator"}
                            onClick={() => setIndex(i)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}