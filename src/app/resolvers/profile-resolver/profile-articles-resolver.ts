import { ResolveFn } from '@angular/router'
import { CollectionType } from '../../models/collection-type'
import { Article } from '../../models/article'
import { inject } from '@angular/core'
import { ProfileApi } from '../../services/api/profile-api/profile-api'

export const profileArticlesResolver: ResolveFn<CollectionType<Article>> = (route, state) => {
  const profileApi = inject(ProfileApi)

  return profileApi.getProfileArticles(route.params['profileId'])
}
