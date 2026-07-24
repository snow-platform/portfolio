import { inject, Service } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../../environments/environment'
import { ProfileHero } from '../../../models/profile-hero'
import { ProfileNavi } from '../../../models/profile-navi'
import { Paginated } from '../../../models/paginated'
import { ProfileCard } from '../../../models/profile-card'
import { ProfilePlus } from '../../../models/profile-plus'
import { ProfileCareer } from '../../../models/profile-career'

@Service()
export class ProfileApi {
  private readonly _httpClient = inject(HttpClient)

  getProfilesCard(): Observable<Paginated<ProfileCard>> {
    return this._httpClient.get<Paginated<ProfileCard>>(
      `${environment.api.url}/api/v1/profiles/card`
    )
  }

  getProfileNavi(id: string): Observable<ProfileNavi> {
    return this._httpClient.get<ProfileNavi>(
      `${environment.api.url}/api/${environment.api.version}/profiles/${id}/navi`
    )
  }

  getProfileHero(id: string): Observable<ProfileHero> {
    return this._httpClient.get<ProfileHero>(
      `${environment.api.url}/api/${environment.api.version}/profiles/${id}/hero`
    )
  }

  getProfilePlus(id: string): Observable<ProfilePlus> {
    return this._httpClient.get<ProfilePlus>(
      `${environment.api.url}/api/${environment.api.version}/profiles/${id}/plus`
    )
  }

  getProfileWork(id: string): Observable<ProfileCareer[]> {
    return this._httpClient.get<ProfileCareer[]>(
      `${environment.api.url}/api/${environment.api.version}/profiles/${id}/work`
    )
  }
}
