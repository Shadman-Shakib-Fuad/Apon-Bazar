"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Protita image koto millisecond thakbe (5000 = 5 second)
const INTERVAL_MS = 5000;

export default function HeroSlider({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);

  // Prottek bar image bodlale timer notun kore shuru hoy,
  // tai dot e click korle sathe sathe porer image e jhok dey na
  useEffect(() => {
    if (images.length < 2) return;
    const timer = setTimeout(() => {
      setIndex((i) => (i + 1) % images.length);
    }, INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [index, images.length]);

  return (
    <>
      <div className="absolute inset-0">
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt="Apon Bazar"
            fill
            priority={i === 0}
            sizes="100vw"
            className={`object-cover transition-opacity duration-1000 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}