import { ResolveFn } from '@angular/router'
import { Paginated } from '../../models/pagination/paginated'
import { ProfileCard } from '../../models/profile-card'
import { inject } from '@angular/core'
import { ProfileApi } from '../../services/api/profile-api/profile-api'

export const profilesCardResolver: ResolveFn<Paginated<ProfileCard>> = (route, state) => {
  const profileApi = inject(ProfileApi)

  return profileApi.getProfilesCard()
}
