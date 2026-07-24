import { ResolveFn } from '@angular/router'
import { ProfileCareer } from '../../models/profile-career'
import { inject } from '@angular/core'
import { ProfileApi } from '../../services/api/profile-api/profile-api'

export const profileWorkResolver: ResolveFn<ProfileCareer[]> = (route, state) => {
  const profileApi = inject(ProfileApi)

  return profileApi.getProfileWork(route.params['profileId'])
}
