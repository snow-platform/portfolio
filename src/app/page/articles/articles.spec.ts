import { TestBed } from '@angular/core/testing'
import { provideRouter, withComponentInputBinding } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'

import { Articles } from './articles'
import { Article } from '../../models/cms/article'
import { CollectionType } from '../../models/cms/collection-type'
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

/** A trimmed articles collection — the second row is what the CMS sends unpublished. */
const profileArticles = {
  data: [
    {
      id: 13,
      title: 'Example Article of Lorem Ipsum',
      description: 'This is an example article used for testing the articles.',
      slug: 'example-article-of-lorem-ipsum',
      createdAt: '2026-08-04T08:33:54.978Z',
      publishedAt: '2026-08-05T15:59:15.117Z',
      category: { id: 8, name: 'General', slug: 'general' }
    },
    {
      id: 14,
      title: 'Bare Article',
      description: null,
      slug: 'bare-article',
      createdAt: '2026-01-09T08:33:54.978Z',
      publishedAt: null,
      category: null
    }
  ],
  meta: { pagination: { page: 1, pageSize: 6, pageCount: 1, total: 2 } }
} as unknown as CollectionType<Article>

describe('Articles', () => {
  let component: Articles
  let harness: RouterTestingHarness

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'profiles/:profileId/articles',
              component: Articles,
              data: { profileId: { id: 'estellise' }, profileNavi: navi, profileArticles }
            }
          ],
          withComponentInputBinding()
        )
      ]
    })

    harness = await RouterTestingHarness.create()
    component = await harness.navigateByUrl('/profiles/estellise/articles', Articles)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  test('render one row per resolved article, linked by slug', () => {
    // act
    const page = harness.routeNativeElement
    const rows = Array.from(page?.querySelectorAll('main h2') ?? []).map((el) =>
      el.textContent?.trim()
    )

    // assert
    expect(page?.querySelector('h1')?.textContent?.trim()).toEqual('Writing')
    expect(rows).toEqual(['Example Article of Lorem Ipsum', 'Bare Article'])
    expect(page?.querySelector('main a')?.getAttribute('href')).toEqual(
      '/profiles/estellise/articles/example-article-of-lorem-ipsum'
    )
    expect(page?.textContent).toContain('2 entries')
  })

  test('fall back to the created date and drop the category the cms left empty', () => {
    // act
    const page = harness.routeNativeElement

    // assert
    expect(page?.textContent).toContain('Aug 2026')
    expect(page?.textContent).toContain('Jan 2026')
    expect(page?.textContent).toContain('General')
    expect(component.articles.length).toEqual(2)
    expect(component.pagination.total).toEqual(2)
  })
})
