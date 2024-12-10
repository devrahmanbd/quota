import {RouteObject} from 'react-router-dom';
import {lazyAdminRoute} from '@common/admin/routes/lazy-admin-route';

export const appSettingsRoutes: RouteObject[] = [
  {path: 'drive', lazy: () => lazyAdminRoute('DriveSettings')},
];
