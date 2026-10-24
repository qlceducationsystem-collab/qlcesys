import { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog, Modal } from '../../components/ui/Modal.jsx';
import { Field, FormError, FormGrid, Input, MoneyInput, Select, Textarea } from '../../components/ui/Form.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { ErrorState, Loading } from '../../components/ui/States.jsx';
import { tr } from '../../i18n/tr.js';

const emptyValues = (fields) => Object.fromEntries(fields.map((f) => [f.name, f.default ?? '']));

function FieldInput({ field, value, onChange }) {
  const common = { value: value ?? '', onChange: (e) => onChange(e.target.value), required: field.required !== false, name: field.name };
  if (field.type === 'select') return <Select {...common} options={field.options} placeholder={tr('Selecciona…')} />;
  if (field.type === 'money') return <MoneyInput {...common} />;
  if (field.type === 'textarea') return <Textarea {...common} required={false} />;
  return <Input type={field.type || 'text'} maxLength={field.maxLength || 200} {...common} />;
}

const describeChanges = (fields, before, after) =>
  fields
    .filter((f) => String(before[f.name] ?? '') !== String(after[f.name] ?? ''))
    .map((f) => ({ field: f.label, from: f.display?.(before[f.name]) ?? String(before[f.name] ?? '—'), to: f.display?.(after[f.name]) ?? String(after[f.name] ?? '—') }));

export function RecordForm({ fields, initial, onSubmit, onCancel, submitLabel = 'Guardar' }) {
  const [values, setValues] = useState(initial);
  const [state, setState] = useState({ saving: false, error: null });

  const submit = async (e) => {
    e.preventDefault();
    setState({ saving: true, error: null });
    try {
      await onSubmit(values);
    } catch (error) {
      setState({ saving: false, error });
      return;
    }
    setState({ saving: false, error: null });
  };

  return (
    <form onSubmit={submit} className="stack">
      <FormGrid>
        {fields.map((f) => (
          <Field key={f.name} label={f.label} hint={f.hint} full={f.full || f.type === 'textarea'}>
            <FieldInput field={f} value={values[f.name]} onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))} />
          </Field>
        ))}
      </FormGrid>
      <FormError error={state.error} />
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>{tr('Cancelar')}</Button>
        <Button type="submit" loading={state.saving}>{tr(submitLabel)}</Button>
      </div>
    </form>
  );
}

export function RecordManager({ endpoint, title, addLabel = "+ Agregar", fields, columns, toForm = (r) => r, onChanged, emptyText, select = (d) => d, rowId = (r) => r.id }) {
  const { api, period, canEdit } = useWorkspace();
  const list = useAsync(async () => select(await api.get(`${endpoint}?periodId=${period.id}`)), [api, endpoint, period?.id]);
  const [editing, setEditing] = useState(null);
  const [pending, setPending] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [actionError, setActionError] = useState(null);
  const writable = canEdit && period.status === 'OPEN';

  const refresh = async () => {
    await list.reload();
    onChanged?.();
  };

  const save = async (values) => {

    const clean = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v === '' ? null : v]));
    const body = { ...clean, periodId: period.id };
    if (!editing.row) {
      await api.post(endpoint, body);
      setEditing(null);
      return refresh();
    }
    const changes = describeChanges(fields, toForm(editing.row), values);
    if (!changes.length) return setEditing(null);
    setPending({ kind: 'update', row: editing.row, body, changes });
  };

  const confirm = async () => {
    setConfirming(true);
    setActionError(null);
    try {
      if (pending.kind === 'update') await api.put(`${endpoint}/${rowId(pending.row)}`, pending.body);
      else await api.del(`${endpoint}/${rowId(pending.row)}`);
      setPending(null);
      setEditing(null);
      await refresh();
    } catch (error) {
      setActionError(error);
    } finally {
      setConfirming(false);
    }
  };

  const actionCol = writable
    ? [{
        key: '_actions',
        label: tr('Acciones'),
        align: 'right',
        render: (r) => (
          <div className="row-actions">
            <button className="btn-link" onClick={() => setEditing({ row: r })}>{tr('Editar')}</button>
            <button className="btn-link danger" onClick={() => setPending({ kind: 'delete', row: r })}>{tr('Eliminar')}</button>
          </div>
        ),
      }]
    : [];

  return (
    <section className="card">
      <header className="card-head">
        <h3 className="section-title">{tr(title)}</h3>
        {writable && <Button onClick={() => setEditing({ row: null })}>{tr(addLabel)}</Button>}
      </header>
      {list.loading && !list.data ? <Loading /> : list.error ? <ErrorState error={list.error} onRetry={list.reload} /> : (
        <DataTable columns={[...columns, ...actionCol]} rows={list.data || []} empty={emptyText} />
      )}
      {actionError && <FormError error={actionError} />}

      {editing && !pending && (
        <Modal open title={editing.row ? tr('Editar · {title}', { title: title }) : tr('Agregar · {title}', { title: title })} onClose={() => setEditing(null)}>
          <RecordForm fields={fields} initial={editing.row ? toForm(editing.row) : emptyValues(fields)} onSubmit={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}
      <ConfirmDialog
        open={!!pending}
        title={pending?.kind === 'delete' ? tr('Eliminar registro') : tr('Confirmar modificación')}
        message={pending?.kind === 'delete'
          ? tr('Esta acción elimina el registro y recalcula todos los indicadores del periodo.')
          : tr('Revisa los cambios. Al guardar se recalcularán los indicadores del periodo.')}
        details={pending?.changes}
        danger={pending?.kind === 'delete'}
        confirmLabel={pending?.kind === 'delete' ? tr('Eliminar') : tr('Guardar cambios')}
        loading={confirming}
        onConfirm={confirm}
        onClose={() => { setPending(null); setActionError(null); }}
      />
    </section>
  );
}
