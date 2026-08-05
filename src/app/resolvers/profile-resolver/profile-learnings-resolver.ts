import { ResolveFn } from '@angular/router'
import { CollectionType } from '../../models/cms/collection-type'
import { Review } from '../../models/cms/review'
import { inject } from '@angular/core'
import { ProfileApi } from '../../services/api/profile-api/profile-api'

export const profileLearningsResolver: ResolveFn<CollectionType<Review>> = (route, state) => {
  const profileApi = inject(ProfileApi)

  return profileApi.getProfileLearnings(route.params['profileId'])
}
