import { Link } from 'react-router-dom';
import { useWorkspace } from '../../../context/WorkspaceContext.jsx';
import { useAsync } from '../../../hooks/useAsync.js';
import { money } from '../../../utils/format.js';
import { Button } from '../../../components/ui/Button.jsx';
import { Field, FormError, MoneyInput } from '../../../components/ui/Form.jsx';
import { ErrorState, Loading } from '../../../components/ui/States.jsx';
import { AllocationBars, ReadingCard } from '../AllocationView.jsx';
import { MetricCard, MetricGrid, RealBadge, SimBadge, ToolCard } from '../ResultParts.jsx';
import { useSimulation } from '../useSimulation.js';

const SIM_DEFAULT = { RENTA_FIJA: 40000, RENTA_VARIABLE: 30000, BIENES_RAICES: 10000, NEGOCIOS: 5000, LIQUIDEZ: 5000, ALTO_RIESGO: 10000 };
const SIM_FIELDS = [
  ['RENTA_FIJA', 'Renta fija'], ['RENTA_VARIABLE', 'Renta variable'], ['BIENES_RAICES', 'Bienes raíces'],
  ['NEGOCIOS', 'Negocios'], ['LIQUIDEZ', 'Liquidez'], ['ALTO_RIESGO', 'Alto riesgo'],
];

function CurrentPortfolio() {
  const { api, basePath } = useWorkspace();
  const res = useAsync(() => api.get('/academy/allocation'), [api]);
  if (res.loading && !res.data) return <Loading />;
  if (res.error) return <ErrorState error={res.error} onRetry={res.reload} />;
  const { allocation } = res.data;
  return (
    <ToolCard step="1" title="Cartera actual" description="Calculada con los productos que ya registraste. No vuelves a escribir capitales." aside={<RealBadge />}>
      {allocation.total === 0 ? (
        <div className="empty-inline">
          Aún no hay productos clasificados. <Link to={`${basePath}/academia/m/2`}>Registra tus productos en el Módulo 2</Link>.
        </div>
      ) : (
        <div className="split-panel">
          <div>
            <AllocationBars allocation={allocation} />
            <MetricGrid cols={2}>
              <MetricCard label="Cartera total" value={money(allocation.total)} />
              <MetricCard label="Categorías utilizadas" value={`${allocation.categoriesUsed} / 6`} />
            </MetricGrid>
            {allocation.pendingBreakdown > 0 && (
              <p className="small muted">{money(allocation.pendingBreakdown)} siguen por desglosar desde tu diagnóstico y no se incluyen en la lectura.</p>
            )}
          </div>
          <ReadingCard reading={allocation.reading} />
        </div>
      )}
      <p className="small muted">Esta misma distribución se mantiene actualizada en <Link to={`${basePath}/allocation`}>Allocation</Link>.</p>
    </ToolCard>
  );
}

function EducationalSimulation() {
  const { canEdit } = useWorkspace();
  const sim = useSimulation(3, SIM_DEFAULT);
  return (
    <ToolCard step="2" title="Simulación educativa" description="Experimenta con otra distribución. No modifica tu cartera real." aside={<SimBadge />}>
      <form className="stack" onSubmit={(e) => { e.preventDefault(); sim.run(false); }}>
        <div className="form-grid cols-3">
          {SIM_FIELDS.map(([key, label]) => (
            <Field key={key} label={label}><MoneyInput value={sim.input[key]} onChange={sim.set(key)} /></Field>
          ))}
        </div>
        <FormError error={sim.error} />
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={() => { sim.setInput(SIM_DEFAULT); sim.run(false, SIM_DEFAULT); }}>Restablecer</Button>
          {canEdit && <Button type="button" variant="secondary" loading={sim.busy} onClick={() => sim.run(true)}>Guardar simulación</Button>}
          <Button type="submit" loading={sim.busy}>Simular distribución</Button>
        </div>
      </form>
      {sim.savedAt && <p className="small up">Simulación guardada en tu historial educativo.</p>}
      {sim.result && (
        <div className="split-panel">
          <div>
            <AllocationBars allocation={sim.result} />
            <MetricCard label="Cartera simulada" value={money(sim.result.total)} hint={`${sim.result.categoriesUsed} / 6 categorías`} />
          </div>
          <ReadingCard reading={sim.result.reading} />
        </div>
      )}
    </ToolCard>
  );
}

export function M3PortfolioBuilder() {
  return (
    <div className="tool">
      <CurrentPortfolio />
      <EducationalSimulation />
    </div>
  );
}
