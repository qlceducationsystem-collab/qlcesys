import { useState } from 'react';
import { SECTIONS as LESSONS } from '../courseContent.js';
import { ClassViewer } from './ClassViewer.jsx';
import { SectionHead } from './SectionParts.jsx';

export function CourseSection({ section }) {
  const [openIndex, setOpenIndex] = useState(null);
  const classes = section.items?.length ? section.items : LESSONS.map((l) => ({ title: l.title, tag: `Clase ${Number(l.id)}` }));

  return (
    <div className="ps-container course">
      <div className="course-head">
        <SectionHead section={section} compact />
        {section.subtitle && <p className="ps-sub reveal" style={{ '--r': 3 }}>{section.subtitle}</p>}
      </div>
      <div className="course-grid">
        {classes.map((c, i) => (
          <button key={c.title} type="button" className="course-card reveal-card" style={{ '--c': i }} onClick={() => setOpenIndex(i)}>
            <span className="course-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="course-tag">{c.tag || `Clase ${i + 1}`}</span>
            <b>{c.title}</b>
            {c.text && <span className="course-text">{c.text}</span>}
            <span className="course-open" aria-hidden="true">Abrir clase →</span>
          </button>
        ))}
      </div>
      {openIndex !== null && LESSONS[openIndex] && (
        <ClassViewer lessons={LESSONS} index={openIndex} onChange={setOpenIndex} onClose={() => setOpenIndex(null)} />
      )}
    </div>
  );
}
