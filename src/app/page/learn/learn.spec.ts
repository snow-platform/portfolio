import { TestBed } from '@angular/core/testing'
import { provideRouter, withComponentInputBinding } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'

import { Learn } from './learn'
import { CollectionType } from '../../models/cms/collection-type'
import { Review } from '../../models/cms/review'
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
 * A trimmed learnings collection. The first card carries four tags out of order —
 * the page sorts them by name and keeps three — and the two cards repeat a category
 * so the filter row has to de-duplicate.
 */
const profileLearnings = {
  data: [
    {
      id: 21,
      title: 'Example Review of Lorem Ipsum',
      description: 'This is an example review used for testing the learnings.',
      slug: 'example-review-of-lorem-ipsum',
      createdAt: '2026-08-04T08:33:54.978Z',
      publishedAt: '2026-08-05T15:59:15.117Z',
      category: { id: 8, name: 'Patterns', slug: 'patterns' },
      tags: [
        { id: 1, name: 'Zod', slug: 'zod' },
        { id: 2, name: 'Angular', slug: 'angular' },
        { id: 3, name: 'Signals', slug: 'signals' },
        { id: 4, name: 'Rxjs', slug: 'rxjs' }
      ]
    },
    {
      id: 22,
      title: 'Bare Review',
      description: null,
      slug: 'bare-review',
      createdAt: '2026-01-09T08:33:54.978Z',
      publishedAt: null,
      category: { id: 8, name: 'Patterns', slug: 'patterns' },
      tags: null
    }
  ],
  meta: { pagination: { page: 1, pageSize: 6, pageCount: 1, total: 2 } }
} as unknown as CollectionType<Review>

describe('Learn', () => {
  let component: Learn
  let harness: RouterTestingHarness

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'profiles/:profileId/learn',
              component: Learn,
              data: { profileId: { id: 'estellise' }, profileNavi: navi, profileLearnings }
            }
          ],
          withComponentInputBinding()
        )
      ]
    })

    harness = await RouterTestingHarness.create()
    component = await harness.navigateByUrl('/profiles/estellise/learn', Learn)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  test('render one card per resolved review, linked by slug', () => {
    // act
    const page = harness.routeNativeElement
    const cards = Array.from(page?.querySelectorAll('main h2') ?? []).map((el) =>
      el.textContent?.trim()
    )

    // assert
    expect(page?.querySelector('h1')?.textContent?.trim()).toEqual('Learnings')
    expect(cards).toEqual(['Example Review of Lorem Ipsum', 'Bare Review'])
    expect(page?.querySelector('main a')?.getAttribute('href')).toEqual(
      '/profiles/estellise/learn/example-review-of-lorem-ipsum'
    )
    expect(page?.textContent).toContain('2 entries')
  })

  test('de-duplicate the filters and keep the first three tags by name', () => {
    // assert
    expect(component.filters).toEqual(['Patterns'])
    expect(component.tags(component.learnings[0]).map((t) => t.name)).toEqual([
      'Angular',
      'Rxjs',
      'Signals'
    ])
    expect(component.tags(component.learnings[1])).toEqual([])
    expect(component.published(component.learnings[1])).toEqual('Jan 2026')
  })
})
