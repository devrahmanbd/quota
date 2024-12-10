import type {LandingPageData} from '@hc/homepage/use-hc-landing-page-data';
import type {GetArticleResponse} from '@hc/articles/requests/use-article';
import {GetCategoryResponse} from '@hc/categories/use-category';
import {SearchArticlesResponse} from '@hc/search/use-search-articles';

export interface HcBootstrapLoaders {
  hcLandingPage?: LandingPageData;
  articlePage?: GetArticleResponse;
  updateArticle?: GetArticleResponse;
  categoryPage?: GetCategoryResponse;
  updateCategory?: GetCategoryResponse;
  searchArticles?: SearchArticlesResponse;
}
