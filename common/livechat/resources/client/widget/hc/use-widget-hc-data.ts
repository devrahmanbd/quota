import {useQuery} from '@tanstack/react-query';
import {apiClient} from '@common/http/query-client';
import {Category} from '@hc/categories/category';

interface WidgetHcDataResponse {
  categories: Category[];
}

export function useWidgetHcData() {
  return useQuery({
    queryKey: ['widget', 'hc', 'data'],
    queryFn: () => fetchData(),
  });
}

async function fetchData() {
  return apiClient
    .get<WidgetHcDataResponse>(`lc/widget/help-center-data`, {})
    .then(response => response.data);
}
