import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { trackEvent } from '../../../api/client.js';
import { IntroReveal } from '../../../components/public/IntroReveal.jsx';
import { PublicNavbar } from '../../../components/public/PublicNavbar.jsx';
import { BRAND_FULL } from '../../../components/layout/Brand.jsx';
import { SectionStage } from '../../../components/public/SectionStage.jsx';
import { HeroSection } from '../sections/HeroSection.jsx';
import { CourseSection } from '../sections/CourseSection.jsx';
import { AccessSection, FeatureSection, GenericSection, LayersSection, QlcSection } from '../sections/InfoSections.jsx';
import { CopytradingFilter } from './CopytradingFilter.jsx';
import { LegalNotice } from './LegalNotice.jsx';
import { usePublicContent } from './usePublicContent.js';

const RENDERERS = {
  inicio: HeroSection,
  curso: CourseSection,
  patrimonio: LayersSection,
  plataforma: FeatureSection,
  acceso: AccessSection,
  qlc: QlcSection,
};

export default function PublicExperience() {
  const content = usePublicContent();
  const sections = content.sections;
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const tracked = useRef(new Set());

  const requested = params.get('s');
  const activeKey = sections.some((s) => s.key === requested) ? requested : sections[0]?.key;
  const byKey = useMemo(() => Object.fromEntries(sections.map((s) => [s.key, s])), [sections]);

  useEffect(() => {
    document.body.classList.add('public-locked');
    trackEvent('PUBLIC_PAGE_VIEW');
    return () => document.body.classList.remove('public-locked');
  }, []);

  useEffect(() => {
    if (!activeKey || tracked.current.has(activeKey)) return;
    tracked.current.add(activeKey);
    trackEvent('PUBLIC_SECTION_VIEW', { section: activeKey });
  }, [activeKey]);

  useEffect(() => {
    const section = byKey[activeKey];
    if (section) document.title = `${section.navLabel} · ${BRAND_FULL}`;
  }, [activeKey, byKey]);

  const select = useCallback((key) => {
    if (key && key !== activeKey) setParams(key === sections[0]?.key ? {} : { s: key });
  }, [activeKey, sections, setParams]);

  const go = useCallback((target) => {
    if (!target) return;
    if (target === 'filtro-qlc') return setFilterOpen(true);
    if (target.startsWith('/')) return navigate(target);
    if (/^https?:\/\//.test(target)) return window.open(target, '_blank', 'noopener');
    return select(target);
  }, [navigate, select]);

  const render = (key) => {
    const section = byKey[key];
    if (!section) return null;
    const Renderer = RENDERERS[key] || GenericSection;
    return <Renderer section={section} offers={content.offers || []} go={go} />;
  };

  return (
    <div className="public-shell">
      <IntroReveal />
      <PublicNavbar sections={sections} activeKey={activeKey} onSelect={select} onLegal={() => setLegalOpen(true)} />
      <main className="public-stage" id="contenido">
        {activeKey && <SectionStage activeKey={activeKey} render={render} />}
        <nav className="stage-dots" aria-label="Secciones">
          {sections.map((s) => (
            <button key={s.key} type="button" aria-label={s.navLabel} className={s.key === activeKey ? 'is-active' : ''} onClick={() => select(s.key)} />
          ))}
        </nav>
      </main>
      <CopytradingFilter open={filterOpen} onClose={() => setFilterOpen(false)} />
      <LegalNotice open={legalOpen} onClose={() => setLegalOpen(false)} />
    </div>
  );
}
