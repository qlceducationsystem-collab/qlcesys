import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { I18nProvider } from './i18n/I18nContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import { UpdatePrompt } from './features/updates/UpdatePrompt.jsx';
import './styles/tokens.css';
import './styles/base.css';
import './styles/app.css';
import './styles/public.css';
import './styles/academy.css';
import './styles/admin.css';
import './styles/update.css';
import './styles/marketing.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <AppRoutes />
          <UpdatePrompt />
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
