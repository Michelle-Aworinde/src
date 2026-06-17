import { useEffect, useState, useRef } from "react";

interface Props {
  images: string[];
  height?: number;
  autoPlayMs?: number | null;
}

export default function ImageCarousel({ images, height = 600, autoPlayMs = 4000 }: Props) {
  const [index, setIndex] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!autoPlayMs || images.length <= 1) return;
    timer.current = window.setInterval(() => setIndex((i) => (i + 1) % images.length), autoPlayMs);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [images.length, autoPlayMs]);

  function prev() { setIndex((i) => (i - 1 + images.length) % images.length); }
  function next() { setIndex((i) => (i + 1) % images.length); }

  if (!images || images.length === 0) return null;

  return (
    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 8, height }}>
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Slide ${i + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: `${(i - index) * 100}%`,
              transition: 'left 400ms ease',
            }}
          />
        ))}

        <button aria-label="Previous" onClick={prev} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: 6, cursor: 'pointer' }}>‹</button>
        <button aria-label="Next" onClick={next} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: 6, cursor: 'pointer' }}>›</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
        {images.map((_, i) => (
          <button key={i} aria-label={`Go to slide ${i + 1}`} onClick={() => setIndex(i)} style={{ width: 10, height: 10, borderRadius: 10, border: 'none', background: i === index ? '#0b5ed7' : '#cfd6e6', cursor: 'pointer' }} />
        ))}
      </div>
    </div>
  );
}
