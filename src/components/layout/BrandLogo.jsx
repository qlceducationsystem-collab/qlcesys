import { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';

export const LOGOS = {
  es: '/brand/qlc-logo.png',
  en: '/brand/qlc-logo-en.png',
};

const FALLBACK = LOGOS.es;
const isVideo = (src) => /\.(mp4|webm|ogg|mov)$/i.test(src);

export function BrandLogo({ alt = '', className = '', width, height }) {
  const { lang } = useI18n();
  const [failed, setFailed] = useState({});
  const wanted = LOGOS[lang] || FALLBACK;
  const src = failed[wanted] ? FALLBACK : wanted;
  const onError = () => src !== FALLBACK && setFailed((f) => ({ ...f, [src]: true }));

  if (isVideo(src)) {
    return (
      <video
        key={src}
        className={`brand-logo ${className}`}
        src={src}
        width={width}
        height={height}
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        onError={onError}
      />
    );
  }
  return <img key={src} className={`brand-logo ${className}`} src={src} alt={alt} width={width} height={height} onError={onError} />;
}
