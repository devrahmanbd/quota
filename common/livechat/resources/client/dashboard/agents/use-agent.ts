import {useQuery} from '@tanstack/react-query';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient} from '@common/http/query-client';
import {FullAgent} from '@common/help-desk/agents/agent';

interface Response extends BackendResponse {
  agent: FullAgent;
}

export function useAgent(agentId: number | string) {
  return useQuery({
    queryKey: ['helpdesk', 'agents', agentId],
    queryFn: () => fetchAgent(agentId!),
  });
}

function fetchAgent(agentId: number | string) {
  return apiClient
    .get<Response>(`helpdesk/agents/${agentId}`)
    .then(response => response.data);
}
