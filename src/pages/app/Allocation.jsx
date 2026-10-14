import { usePeriodSummary } from '../../hooks/usePeriodSummary.js';
import { money, pct } from '../../utils/format.js';
import { Card, PageHeader } from '../../components/ui/Card.jsx';
import { AsyncView, Empty } from '../../components/ui/States.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { DistributionBars } from '../../components/charts/Charts.jsx';
import { RequirePeriod } from '../../features/periods/PeriodControls.jsx';

function Body({ s }) {
  const { portfolio, protection, balanceSheet } = s;
  // Composición de activos: categorías de la cartera + liquidez (Protección).
  const total = balanceSheet.assets;
  const share = (v) => (total ? (v / total) * 100 : 0);
  const assetsMix = [
    ...portfolio.categories.map((c) => ({ key: c.code, label: c.name, value: c.final, share: share(c.final) })),
    ...(protection.total ? [{ key: 'LIQ', label: 'Liquidez y reservas', value: protection.total, share: share(protection.total) }] : []),
  ];

  return (
    <>
      <PageHeader title="Allocation / distribución patrimonial" subtitle="¿De dónde proviene tu patrimonio?" />
      {assetsMix.length === 0 ? (
        <Empty title="Sin distribución todavía" text="Registra productos en Mi cartera o liquidez en Protección financiera para ver tu distribución." />
      ) : (
        <>
          <div className="layout">
            <Card title={`Distribución de activos · ${money(total)}`}>
              <DistributionBars items={assetsMix} />
            </Card>
            <Card title="Lectura educativa">
              <p className="muted">Una cartera no debe evaluarse únicamente por rendimiento potencial. También importa su liquidez, riesgo, horizonte y función dentro del patrimonio.</p>
              <p className="muted">Una pequeña exposición a una categoría de alto riesgo puede ser muy diferente a concentrar todo el patrimonio en ella.</p>
              <div className="gold-note">Exposición a activos de alto riesgo: <b>{pct(s.indicators.highRiskShare)}</b> de la cartera.</div>
            </Card>
          </div>
          <Card title="Detalle por producto">
            <DataTable
              rowKey="positionId"
              rows={[...portfolio.products].sort((a, b) => b.final - a.final)}
              columns={[
                { key: 'name', label: 'Producto' },
                { key: 'categoryName', label: 'Categoría' },
                { key: 'final', label: 'Capital', align: 'right', render: (p) => money(p.final) },
                { key: 'share', label: '% de la cartera', align: 'right', render: (p) => pct(p.share) },
                { key: 'pat', label: '% del patrimonio (activos)', align: 'right', render: (p) => pct(share(p.final)) },
              ]}
            />
          </Card>
        </>
      )}
    </>
  );
}

export default function Allocation() {
  const res = usePeriodSummary();
  return (
    <RequirePeriod>
      <AsyncView {...res} data={res.summary} onRetry={res.reload}>{(s) => <Body s={s} />}</AsyncView>
    </RequirePeriod>
  );
}
