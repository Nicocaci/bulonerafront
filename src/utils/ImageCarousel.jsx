// ImageCarousel.jsx
import React, { useEffect, useRef, useState } from "react";
import "../css/ImageCarousel.css"; // CSS más abajo

/**
 * props:
 * - images: [{src, alt, srcSet?}] array obligatorio
 * - interval: ms entre slides (default 4000)
 * - showArrows, showIndicators: booleans
 */
export default function ImageCarousel({
    images = [
        {src:"/img-fondo-1.png", alt:"fondo1"},
        {src:"/img-fondo-2.png", alt:"fondo2"},
        {src:"/img-fondo-3.png", alt:"fondo2"},

    ],
    interval = 2000,
    showArrows = true,
    showIndicators = true,
    className = "",
}) {
    const [index, setIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timerRef = useRef(null);
    const containerRef = useRef(null);

    // autoplay
    useEffect(() => {
        if (isPaused || images.length <= 1) return;
        timerRef.current = setInterval(() => {
            setIndex((i) => (i + 1) % images.length);
        }, interval);
        return () => clearInterval(timerRef.current);
    }, [isPaused, images.length, interval]);

    // clear interval on unmount
    useEffect(() => {
        return () => clearInterval(timerRef.current);
    }, []);

    // keyboard navigation (left/right)
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [index, images.length]);

    // touch (swipe) support simple
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
    }, [index, images.length]);

    const prev = () =>
        setIndex((i) => (i - 1 + images.length) % Math.max(images.length, 1));
    const next = () => setIndex((i) => (i + 1) % images.length);

    if (!images || images.length === 0) return null;

    return (
        <div
            className={`home-banner carousel ${className}`}
            ref={containerRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            aria-roledescription="carousel"
            aria-label="Galería de imágenes"
        >
            <ul className="carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
                {images.map((img, i) => (
                    <li
                        className="carousel-slide"
                        key={i}
                        aria-hidden={i !== index}
                        aria-roledescription="slide"
                        aria-label={`${i + 1} de ${images.length}`}
                    >
                        <img
                            src={img.src}
                            srcSet={img.srcSet}
                            alt={img.alt || `Slide ${i + 1}`}
                            loading="lazy"
                            className="carousel-image"
                        />
                        {/* Texto encima si querés */}
                        {img.caption && <div className="carousel-caption">{img.caption}</div>}
                    </li>
                ))}
            </ul>

            {showArrows && images.length > 1 && (
                <>
                    <button className="carousel-arrow left" onClick={prev} aria-label="Anterior">
                        ‹
                    </button>
                    <button className="carousel-arrow right" onClick={next} aria-label="Siguiente">
                        ›
                    </button>
                </>
            )}

            {showIndicators && images.length > 1 && (
                <div className="carousel-indicators" role="tablist" aria-label="Seleccionar slide">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            className={`indicator ${i === index ? "active" : ""}`}
                            onClick={() => setIndex(i)}
                            aria-current={i === index}
                            aria-label={`Ir a la imagen ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
