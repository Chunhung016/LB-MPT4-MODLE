import React, { useState, useEffect } from 'react';
import { formatImgurUrl } from '../utils/imgur';

interface SafeImgurImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
}

export const SafeImgurImage: React.FC<SafeImgurImageProps> = ({
  src,
  alt,
  className = '',
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(() => formatImgurUrl(src));
  const [hasError, setHasError] = useState(false);
  const [retryStage, setRetryStage] = useState(0);

  useEffect(() => {
    setCurrentSrc(formatImgurUrl(src));
    setHasError(false);
    setRetryStage(0);
  }, [src]);

  const handleError = () => {
    // If it was .png, try .jpg
    if (retryStage === 0 && currentSrc.includes('i.imgur.com') && currentSrc.endsWith('.png')) {
      setRetryStage(1);
      setCurrentSrc(currentSrc.replace(/\.png$/, '.jpg'));
      return;
    }

    // If it was .jpg, try .jpeg
    if (retryStage === 1 && currentSrc.includes('i.imgur.com') && currentSrc.endsWith('.jpg')) {
      setRetryStage(2);
      setCurrentSrc(currentSrc.replace(/\.jpg$/, '.jpeg'));
      return;
    }

    // If it was .jpeg, try direct raw imgur
    if (retryStage === 2 && currentSrc.includes('i.imgur.com')) {
      setRetryStage(3);
      const match = currentSrc.match(/i\.imgur\.com\/([a-zA-Z0-9]+)\./);
      if (match && match[1]) {
        setCurrentSrc(`https://imgur.com/${match[1]}.png`);
        return;
      }
    }

    setHasError(true);
  };

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#FFFBEB] text-[#78350F] p-2 text-center select-none ${className}`}
      >
        <span className="text-xl sm:text-2xl mb-1">🖼️</span>
        <span className="text-[10px] sm:text-xs font-bold leading-tight line-clamp-2">
          {alt || 'Gambar'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      onError={handleError}
      loading="eager"
      {...props}
    />
  );
};
