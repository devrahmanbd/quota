import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {apiClient} from '@common/http/query-client';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {NormalizedModel} from '@ui/types/normalized-model';

interface Response extends BackendResponse {
  results: NormalizedModel[];
}

export function useFileEntryTags(query?: string) {
  return useQuery({
    queryKey: ['file-entry-tags', query],
    queryFn: () => fetchTags(query),
    placeholderData: keepPreviousData,
  });
}

async function fetchTags(query?: string) {
  return apiClient
    .get<Response>('file-entry-tags', {params: {query}})
    .then(r => r.data);
}
