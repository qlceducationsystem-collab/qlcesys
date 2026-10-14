import { useEffect } from 'react';
import { preloadImage, responsiveImage } from '../../../utils/media.js';
import { MoreInfo, SectionCtas, SectionHead } from './SectionParts.jsx';

const FALLBACK_IMAGE = { url: '/brand/qlc-logo.png', width: 516, height: 445 };

export function HeroSection({ section, go }) {
  const image = section.image || FALLBACK_IMAGE;
  const img = responsiveImage(image.url, [480, 640, 960]);

  useEffect(() => {
    if (section.image) preloadImage(section.image.url, 640);
  }, [section.image]);

  return (
    <div className="ps-container ps-hero">
      <div className="hero-copy">
        <SectionHead section={section} as="h1" />
        {section.secondaryText && (
          <div className="hero-note reveal" style={{ '--r': 3 }}>
            <span className="hero-note-text">{section.secondaryText}</span>
            <MoreInfo title="La idea central del curso">
              <p className="muted">{section.secondaryText}</p>
            </MoreInfo>
          </div>
        )}
        <SectionCtas section={section} go={go} />
      </div>
      <div className="hero-visual reveal-visual">
        <div className="hero-card">
          <div className="hero-media">
            <img
              {...img}
              sizes="(max-width: 820px) 70vw, 520px"
              alt={section.image ? section.title : 'Quantum Liquidity Capital'}
              width={image.width || 600}
              height={image.height || 600}
              fetchpriority="high"
              decoding="async"
            />
            <span className="hero-glow" aria-hidden="true" />
          </div>
          {section.items?.length > 0 && (
            <div className="hero-mini">
              {section.items.slice(0, 3).map((it) => (
                <div key={it.title}>
                  <b>{it.title}</b>
                  <span>{it.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
