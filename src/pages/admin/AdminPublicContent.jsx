import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { Card, PageHeader, Pill } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { Field, FormError, Input, Textarea } from '../../components/ui/Form.jsx';
import { AsyncView } from '../../components/ui/States.jsx';
import { HeroSection } from '../public/sections/HeroSection.jsx';
import { CourseSection } from '../public/sections/CourseSection.jsx';
import { AccessSection, FeatureSection, GenericSection, LayersSection, QlcSection } from '../public/sections/InfoSections.jsx';

const RENDERERS = { inicio: HeroSection, curso: CourseSection, patrimonio: LayersSection, plataforma: FeatureSection, acceso: AccessSection, qlc: QlcSection };
const TEXT_FIELDS = [
  ['navLabel', 'Etiqueta en el menú', 40], ['eyebrow', 'Eyebrow', 120], ['title', 'Título', 160], ['highlight', 'Texto destacado del título', 80],
  ['subtitle', 'Subtítulo', 300], ['primaryCtaLabel', 'Botón principal', 80], ['primaryCtaTarget', 'Destino botón principal', 80],
  ['secondaryCtaLabel', 'Botón secundario', 80], ['secondaryCtaTarget', 'Destino botón secundario', 80],
];
const LONG_FIELDS = [['description', 'Descripción', 900], ['secondaryText', 'Texto secundario', 600]];
const toForm = (s) => ({
  ...Object.fromEntries([...TEXT_FIELDS, ...LONG_FIELDS].map(([k]) => [k, s[k] || ''])),
  active: s.active,
  items: (s.items || []).map((i) => ({ title: i.title || '', text: i.text || '', tag: i.tag || '' })),
});

function Preview({ section }) {
  const frame = useRef(null);
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    const update = () => setScale((frame.current?.clientWidth || 640) / 1280);
    update();
    const ro = new ResizeObserver(update);
    if (frame.current) ro.observe(frame.current);
    return () => ro.disconnect();
  }, []);
  const Renderer = RENDERERS[section.key] || GenericSection;
  return (
    <div className="cms-preview" ref={frame} style={{ height: 760 * scale }}>
      <div className="cms-canvas" style={{ transform: `scale(${scale})` }} aria-hidden="true" inert="">
        <div className="cms-stage public-shell"><div className="stage-layer is-static"><Renderer section={section} offers={[]} go={() => null} /></div></div>
      </div>
    </div>
  );
}

function ItemsEditor({ items, onChange, disabled }) {
  const update = (i, key, value) => onChange(items.map((it, j) => (j === i ? { ...it, [key]: value } : it)));
  return (
    <div className="items-editor">
      {items.map((it, i) => (
        <div key={i} className="items-row">
          <Input placeholder="Etiqueta" value={it.tag} maxLength={40} onChange={(e) => update(i, 'tag', e.target.value)} disabled={disabled} />
          <Input placeholder="Título" value={it.title} maxLength={120} onChange={(e) => update(i, 'title', e.target.value)} disabled={disabled} />
          <Input placeholder="Texto" value={it.text} maxLength={400} onChange={(e) => update(i, 'text', e.target.value)} disabled={disabled} />
          {!disabled && <button type="button" className="btn-link danger" onClick={() => onChange(items.filter((_, j) => j !== i))}>Quitar</button>}
        </div>
      ))}
      {!disabled && items.length < 12 && <Button variant="secondary" type="button" onClick={() => onChange([...items, { tag: '', title: '', text: '' }])}>+ Agregar elemento</Button>}
    </div>
  );
}

function SectionEditor({ section, canEdit, onSaved }) {
  const [form, setForm] = useState(() => toForm(section));
  const [confirm, setConfirm] = useState(false);
  const [state, setState] = useState({ busy: false, error: null, saved: false });
  const fileRef = useRef(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const preview = useMemo(() => ({ ...section, ...form, items: form.items.filter((i) => i.title) }), [section, form]);

  const run = async (fn) => {
    setState({ busy: true, error: null, saved: false });
    try {
      const updated = await fn();
      setState({ busy: false, error: null, saved: true });
      onSaved(updated);
    } catch (error) {
      setState({ busy: false, error, saved: false });
    }
  };

  const save = () => run(async () => {
    setConfirm(false);
    const body = { ...form, items: form.items.filter((i) => i.title.trim()).map((i) => ({ title: i.title, text: i.text || null, tag: i.tag || null })) };
    return api.put(`/admin/public-content/${section.key}`, body);
  });

  const upload = (file) => run(async () => {
    const data = new FormData();
    data.append('file', file);
    return api.upload(`/admin/public-content/${section.key}/image`, data);
  });

  return (
    <div className="cms-editor">
      <Card title={`Editar · ${section.navLabel}`} actions={<Pill variant={form.active ? '' : 'muted'}>{form.active ? 'Visible' : 'Oculta'}</Pill>}>
        <div className="form-grid cols-2">
          {TEXT_FIELDS.map(([k, label, max]) => (
            <Field key={k} label={label}><Input value={form[k]} maxLength={max} onChange={set(k)} disabled={!canEdit} /></Field>
          ))}
          {LONG_FIELDS.map(([k, label, max]) => (
            <Field key={k} label={label} full><Textarea rows={3} value={form[k]} maxLength={max} onChange={set(k)} disabled={!canEdit} /></Field>
          ))}
          <label className="check field-full"><input type="checkbox" checked={form.active} onChange={set('active')} disabled={!canEdit} /> Sección visible en la página pública</label>
        </div>
        <p className="small muted">Destinos válidos: clave de otra sección (curso, acceso…), una ruta como /registro, una URL externa o filtro-qlc.</p>
        <h4 className="cms-sub">Elementos de la sección</h4>
        <ItemsEditor items={form.items} onChange={(items) => setForm({ ...form, items })} disabled={!canEdit} />
        <h4 className="cms-sub">Imagen</h4>
        <div className="cms-image">
          {section.image ? <img src={section.image.url} alt="" /> : <span className="muted small">Sin imagen. Se usa el logotipo QLC.</span>}
          {canEdit && (
            <>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => e.target.files[0] && upload(e.target.files[0])} />
              <Button variant="secondary" loading={state.busy} onClick={() => fileRef.current?.click()}>{section.image ? 'Reemplazar imagen' : 'Subir imagen'}</Button>
              {section.image && <Button variant="secondary" onClick={() => run(() => api.del(`/admin/public-content/${section.key}/image`))}>Quitar</Button>}
            </>
          )}
        </div>
        <FormError error={state.error} />
        {state.saved && <p className="small up">Cambios guardados. La página pública se actualiza en menos de un minuto.</p>}
        {canEdit && <div className="form-actions"><Button loading={state.busy} onClick={() => setConfirm(true)}>Guardar cambios</Button></div>}
      </Card>
      <Card title="Vista previa"><Preview section={preview} /></Card>
      <ConfirmDialog open={confirm} title="Publicar cambios" message="Los cambios se verán en la página pública y quedarán registrados en la auditoría." onConfirm={save} onClose={() => setConfirm(false)} />
    </div>
  );
}

export default function AdminPublicContent() {
  const { user } = useAuth();
  const res = useAsync(() => api.get('/admin/public-content'), []);
  const [selected, setSelected] = useState(null);
  const canEdit = ['EDIT', 'FULL'].includes(user?.adminLevel);

  const move = async (sections, index, dir) => {
    const keys = sections.map((s) => s.key);
    [keys[index], keys[index + dir]] = [keys[index + dir], keys[index]];
    await api.put('/admin/public-content/order', { keys });
    res.reload();
  };

  return (
    <>
      <PageHeader kicker="Contenido" title="Contenido público" subtitle="Edita textos, imágenes y orden de las secciones de la página pública." />
      <AsyncView {...res} onRetry={res.reload}>
        {(sections) => {
          const current = sections.find((s) => s.key === selected) || sections[0];
          return (
            <div className="cms">
              <aside className="cms-list">
                {sections.map((s, i) => (
                  <div key={s.key} className={`cms-item ${current?.key === s.key ? 'is-active' : ''}`}>
                    <button type="button" onClick={() => setSelected(s.key)}>
                      <span>{String(i + 1).padStart(2, '0')}</span>
                      <b>{s.navLabel}</b>
                      {!s.active && <small>oculta</small>}
                    </button>
                    {canEdit && (
                      <span className="cms-order">
                        <button type="button" aria-label="Subir" disabled={i === 0} onClick={() => move(sections, i, -1)}>↑</button>
                        <button type="button" aria-label="Bajar" disabled={i === sections.length - 1} onClick={() => move(sections, i, 1)}>↓</button>
                      </span>
                    )}
                  </div>
                ))}
              </aside>
              {current && <SectionEditor key={`${current.key}-${current.updatedAt}`} section={current} canEdit={canEdit} onSaved={() => res.reload()} />}
            </div>
          );
        }}
      </AsyncView>
    </>
  );
}
