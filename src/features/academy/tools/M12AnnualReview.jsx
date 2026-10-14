import { useState } from 'react';
import { useWorkspace } from '../../../context/WorkspaceContext.jsx';
import { useAsync } from '../../../hooks/useAsync.js';
import { date, dateTime, money, pct, signedMoney } from '../../../utils/format.js';
import { Button } from '../../../components/ui/Button.jsx';
import { DataTable } from '../../../components/ui/DataTable.jsx';
import { Field, FormError, MoneyInput, Textarea } from '../../../components/ui/Form.jsx';
import { Pill, ProgressBar } from '../../../components/ui/Card.jsx';
import { DistributionBars } from '../../../components/charts/Charts.jsx';
import { ErrorState } from '../../../components/ui/States.jsx';
import { ExplainRows, KindBadge, MetricCard, MetricGrid, RiskNote, SaveStatus, ToolCard, ToolSkeleton } from '../ResultParts.jsx';
import { useAction } from '../useAction.js';

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const longDate = (ymd) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return `${d} de ${MONTHS[m - 1]} de ${y}`;
};
const toneOf = (v, inverse = false) => (v === 0 ? '' : (v > 0) !== inverse ? 'good' : 'bad');

function GoalCard({ report, reload }) {
  const { api, canEdit } = useWorkspace();
  const action = useAction();
  const [amount, setAmount] = useState(String(report.goal?.targetAmount ?? ''));
  const g = report.goalProgress;
  const save = async () => {
    if (await action.run(() => api.put('/academy/annual-review/goal', { targetAmount: Number(amount) }))) await reload();
  };
  return (
    <ToolCard title="Meta patrimonial" description="Proviene de tus metas financieras. Si no existe, regístrala aquí una sola vez." aside={<KindBadge kind="PLAN" />}>
      {g ? (
        <>
          <ExplainRows
            title="Avance"
            rows={[
              ['Meta patrimonial', money(g.goal)],
              ['Patrimonio final', money(g.current)],
              [g.reached ? 'Meta superada por' : 'Distancia a la meta', money(Math.abs(g.distance))],
            ]}
            final={{ label: 'Avance de la meta', value: pct(g.progress), tone: g.reached ? 'up' : '' }}
          />
          <ProgressBar value={Math.min(100, g.progress || 0)} label="Avance de la meta patrimonial" />
        </>
      ) : (
        <p className="empty-inline">{report.goal ? 'Sin patrimonio final disponible para medir el avance.' : 'Aún no registras una meta patrimonial.'}</p>
      )}
      {canEdit && (
        <div className="inline-form">
          <Field label={report.goal ? 'Actualizar meta patrimonial' : 'Meta patrimonial al cierre'}>
            <MoneyInput min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          </Field>
          <Button variant="secondary" loading={action.busy} disabled={!Number(amount)} onClick={save}>Guardar meta</Button>
        </div>
      )}
      <FormError error={action.error} />
    </ToolCard>
  );
}

function NotesCard({ report }) {
  const { api, canEdit } = useWorkspace();
  const action = useAction();
  const [note, setNote] = useState(report.note?.note || '');
  return (
    <ToolCard title="Notas de revisión anual" description="Tus notas no modifican datos financieros.">
      <Field label="Notas">
        <Textarea maxLength={5000} value={note} onChange={(e) => setNote(e.target.value)} disabled={!canEdit} placeholder="Ej. Reducir deuda y aumentar liquidez" />
      </Field>
      <FormError error={action.error} />
      {canEdit && (
        <div className="form-actions">
          <SaveStatus action={action} savedText="Notas guardadas." />
          <Button variant="secondary" loading={action.busy} onClick={() => action.run(() => api.put('/academy/annual-review/note', { note }))}>Guardar notas</Button>
        </div>
      )}
    </ToolCard>
  );
}

function History({ reloadKey }) {
  const { api } = useWorkspace();
  const res = useAsync(() => api.get('/academy/annual-review/history'), [api, reloadKey]);
  const [error, setError] = useState(null);
  return (
    <ToolCard title="Historial de revisiones" description="Cada revisión guardada conserva sus cifras aunque cambien tus datos actuales.">
      <DataTable
        rows={res.data || []}
        empty={res.loading ? 'Cargando historial…' : 'Aún no guardas revisiones anuales.'}
        columns={[
          { key: 'period', label: 'Periodo', render: (r) => `${date(r.periodStart)} – ${date(r.periodEnd)}` },
          { key: 'finalNetWorth', label: 'Patrimonio final', align: 'right', render: (r) => money(r.finalNetWorth) },
          { key: 'variation', label: 'Variación', align: 'right', render: (r) => <span className={r.variation < 0 ? 'down' : 'up'}>{signedMoney(r.variation)}</span> },
          { key: 'complete', label: 'Información', render: (r) => <Pill variant={r.complete ? '' : 'warn'}>{r.complete ? 'Completa' : 'Incompleta'}</Pill> },
          { key: 'x', label: 'PDF', align: 'right', render: (r) => <button type="button" className="btn-link" onClick={() => api.download(`/academy/annual-review/history/${r.id}/pdf`).catch(setError)}>Descargar</button> },
        ]}
      />
      <FormError error={error} />
    </ToolCard>
  );
}

function Evolution({ report }) {
  const c = report.change;
  return (
    <>
      <MetricGrid cols={2}>
        <MetricCard label="Patrimonio inicial" value={money(c.initialNetWorth)} hint={`Activos − deudas · ${report.initialRef.label}`} />
        <MetricCard label="Patrimonio final" value={money(c.finalNetWorth)} hint={`Activos − deudas · ${report.finalRef.label}`} />
        <MetricCard label="Variación patrimonial" value={signedMoney(c.variation)} tone={toneOf(c.variation)} hint="Final − inicial" />
        <MetricCard label="Variación porcentual" value={c.variationPercent === null ? 'N/D' : pct(c.variationPercent, { signed: true })} tone={toneOf(c.variation)} hint={c.variationPercent === null ? 'Patrimonio inicial en cero' : 'Variación ÷ patrimonio inicial'} />
      </MetricGrid>
      <div className="split-panel">
        <ToolCard title="Resumen del periodo">
          <ExplainRows
            title="Activos y deudas"
            rows={[
              ['Activos iniciales', money(c.initialAssets)],
              ['Activos finales', money(c.finalAssets)],
              ['Variación de activos', signedMoney(c.assetsChange), toneOf(c.assetsChange) === 'good' ? 'up' : toneOf(c.assetsChange) ? 'down' : ''],
              ['Deudas iniciales', money(c.initialDebts)],
              ['Deudas finales', money(c.finalDebts)],
              ['Variación de deudas', signedMoney(c.debtsChange), c.debtsChange < 0 ? 'up' : c.debtsChange > 0 ? 'down' : ''],
            ]}
          />
          <p className="small muted">Patrimonio neto = activos − deudas. Reducir deudas puede mejorar el patrimonio aunque los activos no aumenten.</p>
        </ToolCard>
        <ToolCard title="Distribución final por categoría" description={`Total de activos: ${money(c.finalAssets)}`}>
          <DistributionBars items={report.distribution.map((d) => ({ key: d.category, label: d.category, value: d.amount, share: d.share }))} />
        </ToolCard>
      </div>
      <ToolCard title="Activos" description="Un aumento puede venir de aportaciones, compras, revalorizaciones o rendimientos: no todo es rentabilidad.">
        <DataTable
          rowKey="key"
          rows={report.assets}
          empty="Sin activos registrados en el periodo."
          columns={[
            { key: 'name', label: 'Activo', render: (a) => <b>{a.name}</b> },
            { key: 'category', label: 'Categoría' },
            { key: 'initial', label: 'Valor inicial', align: 'right', render: (a) => money(a.initial) },
            { key: 'final', label: 'Valor final', align: 'right', render: (a) => money(a.final) },
            { key: 'change', label: 'Variación', align: 'right', render: (a) => <span className={a.change < 0 ? 'down' : a.change > 0 ? 'up' : ''}>{signedMoney(a.change)}</span> },
            { key: 'changePercent', label: 'Variación %', align: 'right', render: (a) => pct(a.changePercent) },
          ]}
        />
      </ToolCard>
      <ToolCard title="Deudas y obligaciones" description="Saldos al inicio y al cierre del periodo, sin contar dos veces los pagos.">
        <DataTable
          rowKey="key"
          rows={report.debts}
          empty="Sin deudas registradas en el periodo."
          columns={[
            { key: 'name', label: 'Obligación', render: (d) => <b>{d.name}</b> },
            { key: 'initial', label: 'Saldo inicial', align: 'right', render: (d) => money(d.initial) },
            { key: 'final', label: 'Saldo final', align: 'right', render: (d) => money(d.final) },
            { key: 'change', label: 'Variación', align: 'right', render: (d) => <span className={d.change > 0 ? 'down' : d.change < 0 ? 'up' : ''}>{signedMoney(d.change)}</span> },
          ]}
        />
      </ToolCard>
    </>
  );
}

export function M12AnnualReview({ onSaved }) {
  const { api, canEdit } = useWorkspace();
  const res = useAsync(() => api.get('/academy/annual-review'), [api]);
  const save = useAction();
  const download = useAction();
  const [historyKey, setHistoryKey] = useState(0);

  if (res.loading && !res.data) return <ToolSkeleton />;
  if (res.error) return <ErrorState error={res.error} onRetry={res.reload} />;
  const report = res.data;
  const saveReview = async () => {
    if (await save.run(() => api.post('/academy/annual-review/save', {}))) {
      await res.reload();
      setHistoryKey((k) => k + 1);
      onSaved?.();
    }
  };

  return (
    <div className="tool">
      <div className="period-band">
        <div>
          <span className="section-kicker">Periodo automático · últimos 12 meses completos</span>
          <strong>{longDate(report.window.startDate)} – {longDate(report.window.endDate)}</strong>
          <small>El mes en curso no se incluye. Moneda: {report.currency}. El PDF usa exactamente este periodo.</small>
        </div>
        <div className="row-actions">
          <Pill variant={report.complete ? '' : 'warn'}>{report.complete ? 'Información completa' : 'Información histórica incompleta'}</Pill>
          <Button variant="secondary" loading={download.busy} onClick={() => download.run(() => api.download('/academy/annual-review/pdf'))}>Guardar informe en PDF</Button>
        </div>
      </div>
      <FormError error={download.error} />

      {report.warnings.length > 0 && (
        <div className="warning-list">{report.warnings.map((w) => <RiskNote key={w.code}>{w.message}</RiskNote>)}</div>
      )}

      {report.hasData ? <Evolution report={report} /> : (
        <p className="empty-inline">Cuando registres y cierres tus periodos mensuales, aquí verás la evolución de tu patrimonio. No se muestran cifras de demostración.</p>
      )}

      <div className="split-panel">
        <GoalCard key={`goal-${report.goal?.updatedAt || 'none'}`} report={report} reload={res.reload} />
        <NotesCard key={`note-${report.note?.updatedAt || 'none'}`} report={report} />
      </div>

      <ToolCard title="¿Qué cambió durante el año?" description="Lectura educativa generada con reglas a partir de tus datos. No es una recomendación de inversión." aside={<KindBadge kind="REAL" />}>
        {report.changes.length ? (
          <ul className="change-list">{report.changes.map((c) => <li key={c.key} className={`tone-${c.tone}`}>{c.text}</li>)}</ul>
        ) : <p className="empty-inline">Sin información suficiente para describir cambios.</p>}
      </ToolCard>

      <ToolCard title="Guardar revisión anual" description="Conserva un snapshot del informe de este periodo. No se recalcula con datos posteriores.">
        {report.saved ? (
          <p className="small">Revisión de este periodo guardada el {dateTime(report.saved.generatedAt)}{report.saved.driveFileId ? ' · PDF almacenado en Google Drive' : ''}.</p>
        ) : canEdit ? (
          <div className="form-actions">
            <SaveStatus action={save} savedText="Revisión guardada en tu historial." />
            <Button loading={save.busy} onClick={saveReview}>Guardar revisión anual</Button>
          </div>
        ) : <p className="small muted">Sin revisión guardada para este periodo.</p>}
        <FormError error={save.error} />
      </ToolCard>

      <History reloadKey={historyKey} />
    </div>
  );
}
