import {useMutation} from '@tanstack/react-query';
import {apiClient, queryClient} from '@common/http/query-client';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {toast} from '@ui/toast/toast';
import {useTrans} from '@ui/i18n/use-trans';
import {message} from '@ui/i18n/message';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {Group} from '@common/help-desk/groups/group';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';

interface Response extends BackendResponse {
  group: Group;
}

interface Payload {
  emails: string[];
  role_id: number | string;
  group_id: number | string;
}

export function useSendAgentInvites() {
  const {trans} = useTrans();
  return useMutation({
    mutationFn: (payload: Payload) => sendInvites(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('helpdesk/agents/invites'),
      });
      toast(trans(message('Agents invited')));
    },
    onError: r => showHttpErrorToast(r),
  });
}

function sendInvites(payload: Payload) {
  return apiClient
    .post<Response>('helpdesk/agents/invite', payload)
    .then(r => r.data);
}
