import { ResolveFn } from '@angular/router'
import { Review } from '../../models/cms/review'
import { inject } from '@angular/core'
import { ProfileApi } from '../../services/api/profile-api/profile-api'
import { SingleType } from '../../models/cms/single-type'

export const profileLearningsItemResolver: ResolveFn<SingleType<Review>> = (route, state) => {
  const profileApi = inject(ProfileApi)

  return profileApi.getProfileLearning(route.params['profileId'], route.params['learnId'])
}
