import { Fragment, useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { ErrorState, Loading } from '../../components/ui/States.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { CheckoutModal, offerPrice } from '../access/CheckoutModal.jsx';
import { tr } from '../../i18n/tr.js';

function Rich({ spans = [] }) {
  return spans.map(([text, style], i) => {
    const lines = text.split('\n');
    const content = lines.map((line, k) => <Fragment key={k}>{k > 0 && <br />}{line}</Fragment>);
    if (style === 'bi') return <strong key={i}><em>{content}</em></strong>;
    if (style === 'b') return <strong key={i}>{content}</strong>;
    if (style === 'i') return <em key={i}>{content}</em>;
    return <Fragment key={i}>{content}</Fragment>;
  });
}

function McTable({ rows }) {
  const [head, ...body] = rows;
  return (
    <div className="mc-table-wrap">
      <table className="mc-table">
        <thead><tr>{head.map((cell, i) => <th key={i}><Rich spans={cell} /></th>)}</tr></thead>
        <tbody>{body.map((row, r) => <tr key={r}>{row.map((cell, i) => <td key={i}><Rich spans={cell} /></td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function McGrid({ rows }) {
  return (
    <div className="mc-table-wrap">
      <table className="mc-table">
        <tbody>{rows.map((row, r) => <tr key={r}>{row.map((cell, i) => <td key={i}><Blocks blocks={cell} /></td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function McCallout({ label, blocks }) {
  return (
    <aside className="mc-callout">
      {label && <span className="mc-callout-label">{label}</span>}
      <Blocks blocks={blocks} />
    </aside>
  );
}

const RENDER = {
  title: (b) => <h2 className="mc-title">{b.text}</h2>,
  subtitle: (b) => <p className="mc-subtitle">{b.text}</p>,
  h1: (b) => <h3 className="mc-h1">{b.text}</h3>,
  h2: (b) => <h4 className="mc-h2">{b.text}</h4>,
  h3: (b) => <h5 className="mc-h3">{b.text}</h5>,
  h4: (b) => <h5 className="mc-h3">{b.text}</h5>,
  p: (b) => <p><Rich spans={b.text} /></p>,
  ul: (b) => <ul>{b.items.map((it, i) => <li key={i}><Rich spans={it} /></li>)}</ul>,
  ol: (b) => <ol>{b.items.map((it, i) => <li key={i}><Rich spans={it} /></li>)}</ol>,
  table: (b) => <McTable rows={b.rows} />,
  grid: (b) => <McGrid rows={b.rows} />,
  callout: (b) => <McCallout label={b.label} blocks={b.blocks} />,
};

function Blocks({ blocks = [] }) {
  return blocks.map((b, i) => <Fragment key={i}>{RENDER[b.type]?.(b) ?? null}</Fragment>);
}

function Locked({ status }) {
  const { user } = useAuth();
  const { isAdminView } = useWorkspace();
  const [buy, setBuy] = useState(false);
  return (
    <div className="mc-locked">
      <span className="section-kicker">{tr('Masterclass QLC')}</span>
      <h3>{tr('Contenido exclusivo de la Masterclass')}</h3>
      <p>{status.offer
        ? tr('La Masterclass de cada módulo se adquiere por separado. Con ella obtienes el contenido completo de los 12 módulos de la academia.')
        : tr('La Masterclass está disponible con el acceso completo a QLC Financial Education.')}</p>
      {status.offer && !isAdminView && user?.role === 'CLIENT' && (
        <>
          <p className="mc-price">{offerPrice(status.offer)}</p>
          <Button onClick={() => setBuy(true)}>{tr('Adquirir la Masterclass')}</Button>
        </>
      )}
      {buy && <CheckoutModal offer={status.offer} onClose={() => setBuy(false)} onCompleted={() => window.location.reload()} />}
    </div>
  );
}

function Content({ number }) {
  const { api } = useWorkspace();
  const res = useAsync(() => api.get(`/academy/modules/${number}/masterclass`), [api, number]);
  if (res.loading && !res.data) return <Loading />;
  if (res.error) return <ErrorState error={res.error} onRetry={res.reload} />;
  return <article className="masterclass"><Blocks blocks={res.data.blocks} /></article>;
}

export function Masterclass({ number, status }) {
  if (!status?.available) return <Locked status={status || {}} />;
  return <Content number={number} />;
}
