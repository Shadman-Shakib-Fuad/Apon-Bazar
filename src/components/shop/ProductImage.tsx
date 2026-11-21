// Photo thakle photo dekhay, na thakle emoji dekhay
export function optimizeImage(url: string, size: number) {
  // Cloudinary ke bole dei ei size e chhoto kore, ar bhalo format e pathate
  return url.replace("/upload/", `/upload/c_fill,w_${size},h_${size},q_auto,f_auto/`);
}

export default function ProductImage({
  url,
  emoji,
  alt,
  size = 400,
}: {
  url?: string;
  emoji: string;
  alt: string;
  size?: number;
}) {
  if (!url) return <>{emoji}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={optimizeImage(url, size)}
      alt={alt}
      loading="lazy"
      className="h-full w-full object-contain"
    />
  );
}