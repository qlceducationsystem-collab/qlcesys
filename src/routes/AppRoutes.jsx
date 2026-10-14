import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { WorkspaceProvider } from '../context/WorkspaceContext.jsx';
import { AppLayout } from '../layouts/AppLayout.jsx';
import { AdminClientWorkspace, AdminLayout } from '../layouts/AdminLayout.jsx';
import { AuthLayout } from '../layouts/PublicLayout.jsx';
import { Empty, Loading } from '../components/ui/States.jsx';
import { RequireAuth, RequireMembership } from './guards.jsx';
import Home from '../pages/public/Home.jsx';
import { ForgotPassword, Login, Register, ResetPassword } from '../pages/public/AuthPages.jsx';
import { Subscription, SubscriptionReturn } from '../pages/public/Subscription.jsx';

const page = (loader) => lazy(loader);
// Páginas del área privada: las mismas para cliente y para "Ver / gestionar como cliente".
const PRIVATE_PAGES = [
  ['', page(() => import('../pages/app/Dashboard.jsx'))],
  ['academia', page(() => import('../pages/app/Academy.jsx'))],
  ['academia/herramientas/:tool', page(() => import('../pages/app/Tool.jsx'))],
  ['academia/:month', page(() => import('../pages/app/AcademyModule.jsx'))],
  ['cartera', page(() => import('../pages/app/Portfolio.jsx'))],
  ['cartera/:assetId', page(() => import('../pages/app/AssetDetail.jsx'))],
  ['patrimonio', page(() => import('../pages/app/Patrimony.jsx'))],
  ['ingresos-gastos', page(() => import('../pages/app/CashFlow.jsx'))],
  ['proteccion', page(() => import('../pages/app/Protection.jsx'))],
  ['deudas', page(() => import('../pages/app/Debts.jsx'))],
  ['negocios', page(() => import('../pages/app/Business.jsx'))],
  ['allocation', page(() => import('../pages/app/Allocation.jsx'))],
  ['movimientos', page(() => import('../pages/app/Movements.jsx'))],
  ['cortes', page(() => import('../pages/app/Closes.jsx'))],
  ['informe-anual', page(() => import('../pages/app/AnnualReport.jsx'))],
  ['asesoria', page(() => import('../pages/app/Advisory.jsx'))],
];

const AdminClients = page(() => import('../pages/admin/AdminClients.jsx'));
const AdminClientDetail = page(() => import('../pages/admin/AdminClientDetail.jsx'));
const AdminAppointments = page(() => import('../pages/admin/AdminAppointments.jsx'));
const AdminAudit = page(() => import('../pages/admin/AdminAudit.jsx'));
const AdminTeam = page(() => import('../pages/admin/AdminTeam.jsx'));

const privateRoutes = () =>
  PRIVATE_PAGES.map(([path, Page]) =>
    path === '' ? <Route key="index" index element={<Page />} /> : <Route key={path} path={path} element={<Page />} />,
  );

const NotFound = () => <Empty title="Página no encontrada" text="La dirección no existe." />;

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/recuperar" element={<ForgotPassword />} />
          <Route path="/restablecer" element={<ResetPassword />} />
          <Route element={<RequireAuth role="CLIENT" />}>
            <Route path="/suscripcion" element={<Subscription />} />
            <Route path="/suscripcion/estado" element={<SubscriptionReturn />} />
          </Route>
        </Route>

        <Route path="/app" element={
          <RequireAuth role="CLIENT">
            <RequireMembership>
              <WorkspaceProvider><AppLayout /></WorkspaceProvider>
            </RequireMembership>
          </RequireAuth>
        }>
          {privateRoutes()}
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/clientes/:clientId/app" element={<RequireAuth role="ADMIN"><AdminClientWorkspace /></RequireAuth>}>
          {privateRoutes()}
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/admin" element={<RequireAuth role="ADMIN"><AdminLayout /></RequireAuth>}>
          <Route index element={<AdminClients />} />
          <Route path="clientes/:clientId" element={<AdminClientDetail />} />
          <Route path="citas" element={<AdminAppointments />} />
          <Route path="bitacora" element={<AdminAudit />} />
          <Route path="equipo" element={<AdminTeam />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
