import { TestBed } from '@angular/core/testing'
import { provideRouter, withComponentInputBinding } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'

import { Career } from './career'
import { ProfileCareer } from '../../models/profile-career'
import { ProfileNavi } from '../../models/profile-navi'

/** What the profile resolvers put on the route for Nav and Footer. */
const navi = {
  id: 1,
  email: null,
  first_name: 'Carlo',
  last_name: 'Caballero',
  cv: null,
  socials: []
} as ProfileNavi

/**
 * Two companies as the profile API returns them — the current one has no `leaved`,
 * and its projects arrive in the wrong order so the significance sort is visible.
 */
const profileWork = [
  {
    id: 1,
    profile_id: 1,
    name: 'Contoso',
    position: 'Software Engineer',
    joined: '2024-02-01T00:00:00.000Z',
    leaved: null,
    projects: [
      {
        id: 11,
        career_id: 1,
        title: 'Second Project',
        description: 'The less significant one.',
        significance: 1,
        imijs: null,
        tecks: [{ id: 1, project_id: 11, tech: 'Angular' }]
      },
      {
        id: 12,
        career_id: 1,
        title: 'First Project',
        description: 'The more significant one.',
        significance: 9,
        imijs: [{ id: 2, project_id: 12, imij: 'https://cms.example.test/shot.png' }],
        tecks: null
      }
    ]
  },
  {
    id: 2,
    profile_id: 1,
    name: 'Fabrikam',
    position: 'Junior Developer',
    joined: '2021-06-01T00:00:00.000Z',
    leaved: '2024-01-01T00:00:00.000Z',
    projects: null
  }
] as unknown as ProfileCareer[]

describe('Career', () => {
  let component: Career
  let harness: RouterTestingHarness

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'profiles/:profileId/career',
              component: Career,
              data: { profileId: { id: 'estellise' }, profileNavi: navi, profileWork }
            }
          ],
          withComponentInputBinding()
        )
      ]
    })

    harness = await RouterTestingHarness.create()
    component = await harness.navigateByUrl('/profiles/estellise/career', Career)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  test('render one section per company with its tenure', () => {
    // act
    const page = harness.routeNativeElement
    const companies = Array.from(page?.querySelectorAll('main h2') ?? []).map((el) =>
      el.textContent?.trim()
    )

    // assert
    expect(companies).toEqual(['Contoso', 'Fabrikam'])
    expect(page?.textContent).toContain('Feb 2024 — Present')
    expect(page?.textContent).toContain('Jun 2021 — Jan 2024')
  })

  test('order the projects by significance and fall back when there is no image', () => {
    // act
    const page = harness.routeNativeElement
    const titles = Array.from(page?.querySelectorAll('main h3') ?? []).map((el) =>
      el.textContent?.trim()
    )

    // assert
    expect(titles).toEqual(['First Project', 'Second Project'])
    expect(component.projects(null)).toEqual([])
    expect(page?.querySelector('img')?.getAttribute('src')).toEqual(
      'https://cms.example.test/shot.png'
    )
    expect(page?.textContent).toContain('NO IMAGE')
    expect(page?.textContent).toContain('Angular')
  })
})
