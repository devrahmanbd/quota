import {useQuery} from '@tanstack/react-query';
import {apiClient} from '@common/http/query-client';
import {Chat} from '@livechat/widget/chat/chat';
import {PaginatedBackendResponse} from '@common/http/backend-response/pagination-response';

export function useArchivedChats() {
  return useQuery({
    queryKey: ['dashboard', 'chats', 'archived'],
    queryFn: () => fetchChats(),
  });
}

function fetchChats() {
  return apiClient
    .get<PaginatedBackendResponse<Chat>>('lc/dashboard/archived-chats')
    .then(response => response.data);
}
