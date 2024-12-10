import {apiClient} from '@common/http/query-client';
import {AgentRolesResponse} from '@livechat/dashboard/agents/use-available-agent-roles';
import {AgentGroupsResponse} from '@livechat/dashboard/agents/use-available-agent-groups';
import {useQuery} from '@tanstack/react-query';

export function useRoleGroupAutocomplete() {
  return useQuery({
    queryKey: ['helpdesk', 'groups', 'roles'],
    queryFn: () => fetchGroupsAndRoles(),
  });
}

async function fetchGroupsAndRoles() {
  const [agents, roles] = await Promise.all([
    apiClient
      .get<AgentGroupsResponse>('helpdesk/autocomplete/groups')
      .then(response => response.data),
    apiClient
      .get<AgentRolesResponse>('helpdesk/autocomplete/roles')
      .then(response => response.data),
  ]);
  return {
    ...agents,
    ...roles,
  };
}
