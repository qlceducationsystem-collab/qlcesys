import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { useAsync } from '../../hooks/useAsync.js';
import { dateTime } from '../../utils/format.js';
import { Card, Pill } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { FormError } from '../../components/ui/Form.jsx';
import { tr } from '../../i18n/tr.js';

const EVENT = 'qlc-data-share';

function useDataShare() {
  const res = useAsync(() => api.get('/auth/data-share'), []);
  useEffect(() => {
    const reload = () => res.reload();
    window.addEventListener(EVENT, reload);
    return () => window.removeEventListener(EVENT, reload);
  }, [res.reload]);
  const [state, setState] = useState({ busy: false, error: null });
  const run = async (path) => {
    setState({ busy: true, error: null });
    try {
      await api.post(path, {});
      setState({ busy: false, error: null });
      window.dispatchEvent(new Event(EVENT));
      return true;
    } catch (error) {
      setState({ busy: false, error });
      return false;
    }
  };
  return {
    active: res.data?.active || null,
    loaded: !!res.data,
    busy: state.busy,
    error: state.error,
    start: () => run('/auth/data-share/start'),
    stop: () => run('/auth/data-share/stop'),
  };
}

export function DataShareCard() {
  const share = useDataShare();
  const [confirm, setConfirm] = useState(false);
  if (!share.loaded) return null;
  return (
    <Card id="compartir-datos" title={tr('Compartir mis datos con mi asesor QLC')} actions={share.active ? <Pill>{tr('Compartiendo')}</Pill> : <Pill variant="muted">{tr('No compartido')}</Pill>}>
      {share.active ? (
        <>
          <p className="small">{tr('Estás compartiendo tus datos con el equipo QLC desde el {date}: pueden ver toda la información que registraste en la plataforma para orientarte mejor.', { date: dateTime(share.active.grantedAt) })}</p>
          <p className="small muted">{tr('El acceso termina cuando tú pulses «Dejar de compartir mis datos» o cuando tu asesor lo cierre.')}</p>
          <Button variant="danger" loading={share.busy} onClick={share.stop}>{tr('Dejar de compartir mis datos')}</Button>
        </>
      ) : (
        <>
          <p className="small">{tr('Si necesitas orientación, puedes autorizar que el equipo QLC vea toda la información que registraste: inicio, portafolio, ingresos y gastos, deudas, protección, academia y reportes.')}</p>
          <p className="small muted">{tr('Nadie puede ver tus datos sin tu autorización. El acceso es temporal: dura hasta que tú dejes de compartir o tu asesor lo cierre.')}</p>
          <Button onClick={() => setConfirm(true)}>{tr('Compartir mis datos')}</Button>
        </>
      )}
      <FormError error={share.error} />
      <ConfirmDialog
        open={confirm}
        title={tr('Compartir mis datos')}
        message={tr('El equipo QLC podrá ver toda la información que registraste en la plataforma hasta que tú dejes de compartirla o tu asesor cierre el acceso. ¿Deseas continuar?')}
        loading={share.busy}
        onConfirm={async () => { if (await share.start()) setConfirm(false); }}
        onClose={() => setConfirm(false)}
      />
    </Card>
  );
}

export function DataShareBanner() {
  const share = useDataShare();
  if (!share.active) return null;
  return (
    <div className="admin-banner share-banner">
      <span>{tr('Estás compartiendo tus datos con tu asesor QLC desde el {date}', { date: dateTime(share.active.grantedAt) })}</span>
      <Button variant="secondary" loading={share.busy} onClick={share.stop}>{tr('Dejar de compartir mis datos')}</Button>
    </div>
  );
}
