import { Link } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { money, pct, signedMoney, tone } from '../../utils/format.js';
import { Card, Row } from '../ui/Card.jsx';

export function ReconciliationBanner({ reconciliation, compact }) {
  if (!reconciliation) return null;
  const ok = reconciliation.reconciled;
  return (
    <div className={`recon ${ok ? 'ok' : 'bad'} ${compact ? 'compact' : ''}`} role="status">
      <div className="recon-status">
        <span className="recon-icon" aria-hidden="true">{ok ? '✓' : '!'}</span>
        <b>{ok ? 'PATRIMONIO CONCILIADO' : 'INFORMACIÓN NO CONCILIADA'}</b>
      </div>
      {!compact && (
        <div className="recon-grid">
          <div><span>Patrimonio final Mi cartera</span><strong>{money(reconciliation.portfolioFinal)}</strong></div>
          <div><span>Patrimonio final Movimientos</span><strong>{money(reconciliation.movementsFinal)}</strong></div>
          <div><span>Diferencia</span><strong className={ok ? '' : 'down'}>{money(reconciliation.difference)}</strong></div>
        </div>
      )}
      {!ok && !compact && (
        <p className="recon-help">
          Revisa que el capital inicial de tus productos refleje el patrimonio inicial más las aportaciones y menos las
          deducciones registradas en el periodo.
        </p>
      )}
    </div>
  );
}

export function PatrimonyBreakdown({ patrimony, roi }) {
  return (
    <Card title="Patrimonio del periodo">
      <Row label="Patrimonio inicial" value={money(patrimony.opening)} />
      <Row label="Aportaciones" value={signedMoney(patrimony.contributions)} valueTone={patrimony.contributions ? 'up' : ''} />
      <Row label="Deducciones" value={signedMoney(-patrimony.withdrawals)} valueTone={patrimony.withdrawals ? 'down' : ''} />
      <Row label="Movimiento neto" value={signedMoney(patrimony.netMovement)} valueTone="auto" />
      <Row label="Rentabilidad" value={signedMoney(patrimony.profitability)} valueTone="auto" sub={`ROI ${pct(roi, { signed: true })}`} />
      <div className="final-row">
        <span>Patrimonio final</span>
        <strong>{money(patrimony.final)}</strong>
      </div>
      <p className="small muted">
        Variación {signedMoney(patrimony.variation)} = movimiento neto {signedMoney(patrimony.netMovement)} + rentabilidad{' '}
        {signedMoney(patrimony.profitability)}
      </p>
    </Card>
  );
}

export const Money = ({ value, signed }) => <span className={signed ? tone(value) : ''}>{signed ? signedMoney(value) : money(value)}</span>;
export const Roi = ({ value }) => <span className={tone(value)}>{pct(value, { signed: true })}</span>;

export function ClosedNotice() {
  const { period, basePath } = useWorkspace();
  if (period?.status !== 'CLOSED') return null;
  return (
    <div className="notice gold">
      Este periodo está <b>cerrado</b> y se conserva como histórico. Para registrar nueva información crea el siguiente
      periodo en <Link to={`${basePath}/cortes`}>Cortes mensuales</Link>.
    </div>
  );
}
