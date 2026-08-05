import { ResolveFn } from '@angular/router'
import { CollectionType } from '../../models/cms/collection-type'
import { Article } from '../../models/cms/article'
import { inject } from '@angular/core'
import { ProfileApi } from '../../services/api/profile-api/profile-api'

export const profileLearningsResolver: ResolveFn<CollectionType<Article>> = (route, state) => {
  const profileApi = inject(ProfileApi)

  return profileApi.getProfileLearnings(route.params['profileId'])
}
