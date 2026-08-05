import { ResolveFn } from '@angular/router'
import { Article } from '../../models/cms/article'
import { inject } from '@angular/core'
import { ProfileApi } from '../../services/api/profile-api/profile-api'
import { SingleType } from '../../models/cms/single-type'

export const profileArticlesItemResolver: ResolveFn<SingleType<Article>> = (route, state) => {
  const profileApi = inject(ProfileApi)

  return profileApi.getProfileArticle(route.params['profileId'], route.params['articleId'])
}
