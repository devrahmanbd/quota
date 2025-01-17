import {useMutation} from '@tanstack/react-query';
import {UseFormReturn} from 'react-hook-form';
import {toast} from '@ui/toast/toast';
import {apiClient, queryClient} from '@common/http/query-client';
import {AdminSettings} from '@common/admin/settings/admin-settings';
import {onFormQueryError} from '@common/errors/on-form-query-error';
import {FetchAdminSettingsResponse} from '@common/admin/settings/requests/use-admin-settings';
import {message} from '@ui/i18n/message';

export interface AdminSettingsWithFiles {
  files?: Record<string, File>;
  client?: Partial<AdminSettings['client']>;
  server?: Partial<AdminSettings['server']>;
}

export function useUpdateAdminSettings(
  form: UseFormReturn<AdminSettingsWithFiles>,
) {
  return useMutation({
    mutationFn: (props: AdminSettingsWithFiles) => {
      // todo: test these after refactor
      // if ((props.client as any)?.artistPage?.tabs) {
      //   (props.client as any).artistPage.tabs = JSON.stringify(
      //     (props.client as any).artistPage.tabs,
      //   ) as any;
      // }
      // if ((props.client as any)?.title_page?.sections) {
      //   (props.client as any).title_page.sections = JSON.stringify(
      //     (props.client as any).title_page.sections,
      //   ) as any;
      // }
      // if ((props.client as any)?.publish?.default_credentials) {
      //   (props.client as any).publish.default_credentials = JSON.stringify(
      //     (props.client as any).publish.default_credentials,
      //   ) as any;
      // }

      return updateAdminSettings(props);
    },
    onSuccess: response => {
      toast(message('Settings updated'), {
        position: 'bottom-right',
      });
      return queryClient.setQueryData(['fetchAdminSettings'], response);
    },
    onError: r => onFormQueryError(r, form),
  });
}

function updateAdminSettings({client, server, files}: AdminSettingsWithFiles) {
  const formData = new FormData();
  if (client) {
    formData.set('client', JSON.stringify(client));
  }
  if (server) {
    formData.set('server', JSON.stringify(server));
  }
  Object.entries(files || {}).forEach(([key, file]) => {
    formData.set(key, file);
  });
  return apiClient
    .post<FetchAdminSettingsResponse>('settings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(r => r.data);
}
