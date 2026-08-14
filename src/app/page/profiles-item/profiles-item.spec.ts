import { TestBed } from '@angular/core/testing'
import { provideRouter, withComponentInputBinding } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'

import { ProfilesItem } from './profiles-item'
import { ProfileNavi } from '../../models/profile-navi'
import { ProfilePlus } from '../../models/profile-plus'

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
 * A profile as the API returns it. The skills repeat a category so the grouping is
 * visible, and the career holds four projects so the top-three cut is too.
 */
const profilePlus = {
  external_id: 'estellise',
  first_name: 'Carlo',
  last_name: 'Caballero',
  email: null,
  photo: null,
  title: 'Software Engineer',
  stack: 'Angular',
  state: 'Manila',
  summary: 'Building software that lasts.',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  cv: { id: 1, profile_id: 'estellise', cv: 'https://cdn.example.test/cv.pdf', created_at: null },
  career: [
    {
      id: 1,
      profile_id: 1,
      name: 'Contoso',
      position: 'Software Engineer',
      joined: '2024-02-01T00:00:00.000Z',
      leaved: null,
      projects: [
        { id: 11, career_id: 1, title: 'Fourth', description: null, significance: 1 },
        { id: 12, career_id: 1, title: 'First', description: null, significance: 9 },
        { id: 13, career_id: 1, title: 'Third', description: null, significance: 5 },
        { id: 14, career_id: 1, title: 'Second', description: null, significance: 7 }
      ]
    }
  ],
  skills: [
    { id: 1, profile_id: 1, category: 'Frontend', name: 'Angular', proficiency: 9 },
    { id: 2, profile_id: 1, category: 'Frontend', name: 'TypeScript', proficiency: 8 },
    { id: 3, profile_id: 1, category: 'Backend', name: 'C#', proficiency: 7 },
    { id: 4, profile_id: 1, category: null, name: 'Ignored', proficiency: 1 }
  ],
  certificates: [
    { id: 1, profile_id: 1, name: 'AZ-204', issuer: 'Microsoft', issued_at: '2025-03-01' }
  ],
  educations: [
    {
      id: 1,
      profile_id: 1,
      degree: 'BS Computer Science',
      school: 'Example University',
      field_of_study: 'Computer Science',
      enrolled: '2017-06-01',
      graduated: '2021-05-01'
    }
  ],
  socials: [{ id: 1, profile_id: 'estellise', name: 'GitHub', link: 'https://github.test/carlo' }]
} as unknown as ProfilePlus

describe('ProfilesItem', () => {
  let component: ProfilesItem
  let harness: RouterTestingHarness

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'profiles/:profileId/info',
              component: ProfilesItem,
              data: { profileId: { id: 'estellise' }, profileNavi: navi, profilePlus }
            }
          ],
          withComponentInputBinding()
        )
      ]
    })

    harness = await RouterTestingHarness.create()
    component = await harness.navigateByUrl('/profiles/estellise/info', ProfilesItem)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  test('render the header out of the parts the api filled in', () => {
    // act
    const page = harness.routeNativeElement

    // assert
    expect(component.name).toEqual('Carlo Caballero')
    expect(component.klan).toEqual('Angular · Software Engineer · Manila')
    expect(page?.querySelector('h1')?.textContent?.trim()).toEqual('Carlo Caballero')
    expect(page?.textContent).toContain('Building software that lasts.')
    expect(page?.textContent).toContain('GitHub')
    expect(page?.textContent).toContain('Download résumé')
  })

  test('fall back to the portrait placeholder when there is no photo', () => {
    // act
    const page = harness.routeNativeElement

    // assert
    expect(page?.querySelector('main img')).toBeNull()
    expect(page?.textContent).toContain('portrait')
  })

  test('group the skills by category and keep the three biggest projects', () => {
    // assert
    expect(component.sill).toEqual([
      { category: 'Frontend', items: ['Angular', 'TypeScript'] },
      { category: 'Backend', items: ['C#'] }
    ])
    expect(component.purj(profilePlus.career?.[0].projects ?? null).map((x) => x.name)).toEqual([
      'First',
      'Second',
      'Third'
    ])
    expect(component.purj(null)).toEqual([])
  })

  test('render the career, certifications and education panels', () => {
    // act
    const page = harness.routeNativeElement

    // assert
    expect(page?.textContent).toContain('Contoso')
    expect(page?.textContent).toContain('Feb 2024 — Present')
    expect(page?.textContent).toContain('AZ-204')
    expect(page?.textContent).toContain('2025')
    expect(page?.textContent).toContain('BS Computer Science')
    expect(page?.textContent).toContain('2017 — 2021 · Computer Science')
    expect(page?.querySelector('main a[href="/profiles/estellise/career"]')?.textContent).toContain(
      'View all projects'
    )
  })
})
