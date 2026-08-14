import { TestBed } from '@angular/core/testing'
import { provideRouter, withComponentInputBinding } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'

import { Profiles } from './profiles'
import { Paginated } from '../../models/pagination/paginated'
import { ProfileCard } from '../../models/profile-card'

/**
 * The directory as the profile API pages it. The first card holds four skills out
 * of order — the page ranks them by proficiency, keeps three and appends an
 * ellipsis — the second holds none.
 */
const paginated = {
  items: [
    {
      id: 1,
      external_id: 'estellise',
      first_name: 'Carlo',
      last_name: 'Caballero',
      title: 'Software Engineer',
      state: 'Manila',
      about: 'Building software that lasts.',
      skills: [
        { id: 1, name: 'Docker', proficiency: 2 },
        { id: 2, name: 'Angular', proficiency: 9 },
        { id: 3, name: 'TypeScript', proficiency: 8 },
        { id: 4, name: 'C#', proficiency: 5 }
      ]
    },
    {
      id: 2,
      external_id: 'yukihime',
      first_name: 'Shiori',
      last_name: 'Yukihime',
      title: null,
      state: null,
      about: null,
      skills: null
    }
  ],
  page: 1,
  size: 6,
  total: 2
} as unknown as Paginated<ProfileCard>

describe('Profiles', () => {
  let component: Profiles
  let harness: RouterTestingHarness

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [{ path: 'profiles', component: Profiles, data: { paginated } }],
          withComponentInputBinding()
        )
      ]
    })

    harness = await RouterTestingHarness.create()
    component = await harness.navigateByUrl('/profiles', Profiles)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  test('render one card per resolved profile, linked by external id', () => {
    // act
    const page = harness.routeNativeElement
    const names = Array.from(page?.querySelectorAll('main h2') ?? []).map((el) =>
      el.textContent?.trim()
    )
    const links = Array.from(page?.querySelectorAll('main .grid > a') ?? []).map((el) =>
      el.getAttribute('href')
    )

    // assert
    expect(page?.querySelector('h1')?.textContent?.trim()).toEqual('Profiles')
    expect(names).toEqual(['Carlo Caballero', 'Shiori Yukihime'])
    expect(links).toEqual(['/profiles/estellise/hero', '/profiles/yukihime/hero'])
    expect(page?.textContent).toContain('2 people')
  })

  test('rank the skills, cap them at three and fall back on a half-filled card', () => {
    // act
    const chips = Array.from(
      harness.routeNativeElement?.querySelectorAll('main .grid > a .flex-wrap span') ?? []
    ).map((el) => el.textContent?.trim())

    // assert
    expect(component.skills(component.profilesCard[0])).toEqual([
      'Angular',
      'TypeScript',
      'C#',
      '...'
    ])
    expect(component.skills(component.profilesCard[1])).toEqual([])
    expect(chips).toEqual(['Angular', 'TypeScript', 'C#', '...'])
    expect(component.initial(component.profilesCard[0])).toEqual('CC')
  })
})
