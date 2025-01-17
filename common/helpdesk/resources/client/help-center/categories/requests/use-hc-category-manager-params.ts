import {useParams} from 'react-router-dom';
import {UseCategoriesParams} from '@hc/categories/requests/use-categories';

export function useHcCategoryManagerParams(): UseCategoriesParams {
  const {categoryId} = useParams();
  return categoryId
    ? {type: 'section', parentId: categoryId}
    : {type: 'category'};
}
