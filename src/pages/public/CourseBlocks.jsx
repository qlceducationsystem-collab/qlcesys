// Componentes del curso gratuito (sin HTML incrustado).

// Convierte **texto** en <strong> de forma segura.
export function RichText({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>,
  );
}

function CardGrid({ items, cols, numbered }) {
  return (
    <div className={`pgrid pgrid-${cols}`}>
      {items.map(([title, text], i) => (
        <article className="pcard" key={title}>
          {numbered && <div className="num">{String.fromCharCode(65 + i)}</div>}
          <h3>{title}</h3>
          <p>{text}</p>
        </article>
      ))}
    </div>
  );
}

function Lesson({ title, paragraphs = [], list, after = [], example }) {
  return (
    <div className="lesson">
      <h3>{title}</h3>
      {paragraphs.map((p, i) => <p key={i}><RichText text={p} /></p>)}
      {list && <ul>{list.map((li, i) => <li key={i}><RichText text={li} /></li>)}</ul>}
      {after.map((p, i) => <p key={`a${i}`}><RichText text={p} /></p>)}
      {example && <div className="example"><b>{example[0]}</b> {example[1]}</div>}
    </div>
  );
}

function Timeline({ title, steps }) {
  const body = (
    <div className="timeline">
      {steps.map(([t, d], i) => (
        <div className="step" key={t}>
          <div className="stepnum">{String(i + 1).padStart(2, '0')}</div>
          <div><h3>{t}</h3><p>{d}</p></div>
        </div>
      ))}
    </div>
  );
  return title ? <div className="lesson"><h3>{title}</h3>{body}</div> : body;
}

function CompareTable({ head, rows }) {
  return (
    <div className="ptable-wrap">
      <table className="ptable">
        <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} data-label={head[i]}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function StageBars({ items, note }) {
  return (
    <>
      <div className="pbars">
        {items.map(([label, w]) => (
          <div className="pbar" key={label}><b>{label}</b><div className="track"><div className="fill" style={{ width: `${w}%` }} /></div></div>
        ))}
      </div>
      {note && <p className="pnote">{note}</p>}
    </>
  );
}

export function Block({ block }) {
  switch (block.type) {
    case 'cards': return <CardGrid {...block} />;
    case 'lesson': return <Lesson {...block} />;
    case 'timeline': return <Timeline {...block} />;
    case 'table': return <CompareTable {...block} />;
    case 'bars': return <StageBars {...block} />;
    case 'quote': return <div className="quote">{block.text}{block.source && <small>{block.source}</small>}</div>;
    case 'risk': return <div className="risk"><strong>{block.label}</strong> {block.text}</div>;
    default: return null;
  }
}

export function CourseSection({ section }) {
  return (
    <section id={`clase-${section.id}`} className="psection">
      <div className="container">
        <div className="section-head">
          <div className="kicker">{section.id} · Clase {Number(section.id)}</div>
          <h2>{section.title}</h2>
          <p>{section.intro}</p>
        </div>
        {section.blocks.map((b, i) => <Block key={i} block={b} />)}
      </div>
    </section>
  );
}
