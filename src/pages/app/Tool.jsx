// Herramientas de cálculo de la Academia (Mes 10 y 11). El cálculo lo hace el backend.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { money, pct } from '../../utils/format.js';
import { Card, Notice, PageHeader, Row } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Field, FormError, FormGrid, Input } from '../../components/ui/Form.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { BarChart } from '../../components/charts/Charts.jsx';
import { Empty, ErrorState, Loading } from '../../components/ui/States.jsx';
import { useAsync } from '../../hooks/useAsync.js';

const TOOLS = {
  'rendimiento-neto': {
    month: 10,
    title: 'Calculadora de rendimiento neto',
    subtitle: 'Rendimiento bruto → comisiones → costos → impuesto → resultado final',
    fields: [
      ['capital', 'Capital inicial ($)'], ['returnRate', 'Rendimiento del periodo (%)'], ['commissions', 'Comisiones ($)'],
      ['otherCosts', 'Otros costos ($)'], ['taxRate', 'Impuesto (%)'],
    ],
    defaults: { capital: '', returnRate: '', commissions: 0, otherCosts: 0, taxRate: 0 },
    note: 'Las obligaciones fiscales concretas dependen de la jurisdicción y situación individual y pueden requerir asesoría profesional. El impuesto se aplica sobre la ganancia después de comisiones y costos, no sobre el capital inicial.',
    Result: ({ r }) => (
      <>
        <Row label="Ganancia bruta (capital × rendimiento)" value={money(r.gross)} />
        <Row label="Comisiones" value={`−${money(r.commissions)}`} />
        <Row label="Otros costos" value={`−${money(r.otherCosts)}`} />
        <Row label="Ganancia después de costos" value={money(r.afterCosts)} />
        <Row label="Impuesto" value={`−${money(r.tax)}`} />
        <div className="final-row"><span>Resultado después de impuestos</span><strong>{money(r.net)}</strong></div>
        <Row label="Rendimiento neto sobre capital" value={pct(r.netRate, { signed: true })} valueTone="auto" />
        <Row label="Capital final estimado" value={money(r.finalCapital)} />
      </>
    ),
  },
  'poder-adquisitivo': {
    month: 11,
    title: 'Simulador de poder adquisitivo',
    subtitle: 'Crecimiento nominal frente a crecimiento real',
    fields: [['amount', 'Cantidad ($)'], ['years', 'Horizonte (años)'], ['inflationRate', 'Inflación anual del escenario (%)'], ['nominalRate', 'Crecimiento nominal anual (%)']],
    defaults: { amount: '', years: 10, inflationRate: '', nominalRate: 0 },
    note: 'Escenario educativo. Valor real aproximado = valor nominal / (1 + inflación)^años. No es una proyección de rendimientos.',
    Result: ({ r }) => (
      <>
        <Row label="Valor nominal al final" value={money(r.finalNominal)} />
        <Row label="Valor real al final (en dinero de hoy)" value={money(r.finalReal)} />
        <Row label="Pérdida de poder adquisitivo de la cantidad sin crecer" value={money(r.lossOfPurchasingPower)} valueTone="down" />
        <Row label="Crecimiento real anual" value={pct(r.realRate, { signed: true })} valueTone="auto" />
        <div className={`final-row ${r.beatsInflation ? '' : 'warn'}`}>
          <span>{r.beatsInflation ? 'El crecimiento nominal supera la inflación del escenario' : 'El crecimiento nominal queda por debajo o igual a la inflación del escenario'}</span>
        </div>
        <BarChart data={r.rows.map((x) => ({ label: `A${x.year}`, value: x.real, hint: `Nominal ${money(x.nominal)}` }))} height={150} />
        <DataTable rowKey="year" rows={r.rows} columns={[
          { key: 'year', label: 'Año' },
          { key: 'nominal', label: 'Nominal', align: 'right', render: (x) => money(x.nominal) },
          { key: 'real', label: 'Real', align: 'right', render: (x) => money(x.real) },
        ]} />
      </>
    ),
  },
};

export default function Tool() {
  const { tool } = useParams();
  const cfg = TOOLS[tool];
  const { api, basePath, canEdit } = useWorkspace();
  const [input, setInput] = useState(cfg?.defaults || {});
  const [result, setResult] = useState(null);
  const [state, setState] = useState({ busy: false, error: null, saved: false });
  // La herramienta se desbloquea con su módulo mensual (validado también en backend).
  const mod = useAsync(() => api.get(`/academy/modules/${cfg.month}`), [api, cfg?.month], { enabled: !!cfg });
  if (!cfg) return <Empty title="Herramienta no encontrada" />;
  if (mod.loading) return <Loading />;
  if (mod.error) return <ErrorState error={mod.error} onRetry={mod.reload} />;

  const calc = async (save) => {
    setState({ busy: true, error: null, saved: false });
    try {
      const res = await api.post(`/academy/tools/${tool}`, { input, save });
      setResult(res.result);
      setState({ busy: false, error: null, saved: save });
    } catch (error) {
      setState({ busy: false, error, saved: false });
    }
  };

  return (
    <>
      <Link className="btn-secondary back" to={`${basePath}/academia/${cfg.month}`}>← Módulo del mes {cfg.month}</Link>
      <PageHeader kicker={`Herramienta · Mes ${cfg.month}`} title={cfg.title} subtitle={cfg.subtitle} />
      <div className="layout">
        <Card title="Datos">
          <form className="stack" onSubmit={(e) => { e.preventDefault(); calc(false); }}>
            <FormGrid>
              {cfg.fields.map(([name, label]) => (
                <Field key={name} label={label}>
                  <Input type="number" step="any" required value={input[name]} onChange={(e) => setInput({ ...input, [name]: e.target.value })} />
                </Field>
              ))}
            </FormGrid>
            <FormError error={state.error} />
            <div className="form-actions">
              <Button type="submit" loading={state.busy}>Calcular</Button>
              {canEdit && result && <Button type="button" variant="secondary" onClick={() => calc(true)}>Guardar en mi registro</Button>}
            </div>
            {state.saved && <p className="small up">Resultado guardado en el registro del módulo.</p>}
          </form>
        </Card>
        <Card title="Resultado">{result ? <cfg.Result r={result} /> : <p className="muted">Captura los datos y presiona Calcular.</p>}</Card>
      </div>
      <Notice>{cfg.note}</Notice>
    </>
  );
}
