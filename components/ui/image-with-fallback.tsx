import { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className: string;
  fallbackText: string;
}

export const ImageWithFallback = ({
  src,
  alt,
  className,
  fallbackText,
}: ImageWithFallbackProps) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`${className} flex items-center justify-center `}>
        <span className="text-gradient bg-clip-text text-transparent font-semibold tracking-widest">
          {fallbackText}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      onError={() => setHasError(true)}
      alt={alt}
      className={className}
    />
  );
};
