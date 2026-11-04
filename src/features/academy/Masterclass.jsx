import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { ErrorState, Loading } from '../../components/ui/States.jsx';

export function Masterclass({ number }) {
  const { api } = useWorkspace();
  const res = useAsync(() => api.get(`/academy/modules/${number}/masterclass`), [api, number]);
  if (res.loading && !res.data) return <Loading />;
  if (res.error) return <ErrorState error={res.error} onRetry={res.reload} />;
  return <article className="masterclass" dangerouslySetInnerHTML={{ __html: res.data.html }} />;
}
