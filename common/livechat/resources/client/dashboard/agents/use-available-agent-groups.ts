import {useQuery} from '@tanstack/react-query';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient} from '@common/http/query-client';
import {Group} from '@common/help-desk/groups/group';

export interface AgentGroupsResponse extends BackendResponse {
  groups: Group[];
  defaultGroupId: number;
}

interface Params {
  query?: string;
}
export function useAvailableAgentGroups(params?: Params) {
  return useQuery({
    queryKey: ['helpdesk', 'groups', params],
    queryFn: () => fetchGroups(params),
  });
}

function fetchGroups(params?: Params) {
  return apiClient
    .get<AgentGroupsResponse>('helpdesk/autocomplete/groups', {params})
    .then(response => response.data);
}
