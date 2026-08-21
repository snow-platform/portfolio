import { TestBed } from '@angular/core/testing'
import { provideRouter, withComponentInputBinding } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'

import { LearnItem } from './learn-item'
import { Cover } from '../../models/cms/cover'
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

/** A CMS upload trimmed to the fields `media` reads off it. */
const upload = (id: number, name: string, alt: string | null = null): Cover =>
  ({
    id,
    url: `https://cms.example.test/${name}.jpg`,
    alternativeText: alt,
    caption: null,
    width: 394,
    height: 222,
    formats: { thumbnail: { url: `https://cms.example.test/thumbnail_${name}.jpg` } }
  }) as unknown as Cover

/**
 * A trimmed sample/review.json, including the media block the CMS left empty.
 * `meaning` is the one field the sample leaves null — it drives the panel the
 * review page shows and the article page does not.
 */
const review = {
  id: 4,
  title: 'Example Review',
  description: 'An example review for testing',
  meaning: 'Doubt everything except the love.',
  slug: 'example-review',
  createdAt: '2026-08-04T08:38:05.817Z',
  publishedAt: '2026-08-06T13:20:17.362Z',
  cover: upload(15, '880444220', 'The review cover'),
  category: { id: 8, name: 'General', slug: 'general' },
  author: { id: 3, name: 'Carlo Caballero', avatar: upload(13, '133301699_p0') },
  blocks: [
    { id: 28, body: '# Example\n\nLorem ipsum.', __component: 'shared.rich-text' },
    {
      id: 12,
      files: [upload(16, 'slide_one'), upload(17, 'slide_two')],
      __component: 'shared.slider'
    },
    {
      id: 15,
      title: 'William Shakespeare, Hamlet',
      body: 'Doubt thou the stars are fire;\nBut never doubt I love.',
      __component: 'shared.quote'
    },
    {
      id: 29,
      body: '# Example\n\n```\npublic async Task Example()\n```',
      __component: 'shared.rich-text'
    },
    { id: 13, file: null, __component: 'shared.media' }
  ]
} as unknown as Review

/** The same review as the CMS returns it before anything optional is filled in. */
const bare = {
  id: 5,
  title: 'Bare Review',
  description: null,
  meaning: null,
  slug: 'bare-review',
  createdAt: '2026-01-09T08:38:05.817Z',
  publishedAt: null,
  cover: null,
  category: null,
  author: { id: 3, name: 'Carlo Caballero', avatar: null },
  blocks: []
} as unknown as Review

describe('LearnItem', () => {
  let component: LearnItem
  let harness: RouterTestingHarness

  const route = (path: string, data: Review | null) => ({
    path,
    component: LearnItem,
    data: {
      profileId: { id: 'estellise' },
      profileNavi: navi,
      profileLearningsItem: { data }
    }
  })

  /** Which block each child of the block-list column rendered as, in order. */
  const kinds = () => {
    const list = harness.routeNativeElement?.querySelector('app-block-list > div')

    return Array.from(list?.children ?? []).map((el) => {
      if (el.classList.contains('prose')) return 'rich-text'
      if (el.querySelector('app-slider')) return 'slider'
      if (el.querySelector('blockquote')) return 'quote'

      return 'media'
    })
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            route('profiles/:profileId/learn/missing', null),
            route('profiles/:profileId/learn/bare-review', bare),
            route('profiles/:profileId/learn/:learnId', review)
          ],
          withComponentInputBinding()
        )
      ]
    })

    harness = await RouterTestingHarness.create()
    component = await harness.navigateByUrl('/profiles/estellise/learn/example-review', LearnItem)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  test('render the header from the resolved review', () => {
    // act
    const page = harness.routeNativeElement

    // assert
    expect(page?.querySelector('h1')?.textContent?.trim()).toEqual('Example Review')
    expect(page?.textContent).toContain('General')
    expect(page?.textContent).toContain('Aug 2026')
    expect(page?.textContent).toContain('1 min read')
    expect(page?.textContent).toContain('An example review for testing')
  })

  test('render the meaning panel above the body', () => {
    // act
    const page = harness.routeNativeElement

    // assert
    expect(page?.textContent).toContain('IN ONE SENTENCE')
    expect(page?.textContent).toContain('Doubt everything except the love.')
  })

  test('render the cover and the author avatar', () => {
    // act
    const page = harness.routeNativeElement
    const cover = page?.querySelector('article > img')
    const avatar = page?.querySelector('img[alt="Carlo Caballero"]')

    // assert
    expect(cover?.getAttribute('src')).toEqual('https://cms.example.test/880444220.jpg')
    expect(cover?.getAttribute('alt')).toEqual('The review cover')
    expect(cover?.getAttribute('height')).toEqual('222')
    expect(avatar?.getAttribute('src')).toEqual(
      'https://cms.example.test/thumbnail_133301699_p0.jpg'
    )
  })

  test('render the blocks and skip the empty media block', () => {
    // act
    const body = harness.routeNativeElement?.querySelector('app-block-list')

    // assert
    expect(kinds()).toEqual(['rich-text', 'slider', 'quote', 'rich-text'])
    expect(body?.querySelector('.prose h1')?.textContent).toEqual('Example')
    expect(body?.querySelector('.prose pre code')?.textContent).toContain('public async Task')
    expect(body?.querySelector('figcaption')?.textContent).toContain('William Shakespeare, Hamlet')
    expect(body?.querySelector('blockquote')?.textContent).toContain('But never doubt I love.')
    expect(body?.querySelector('app-slider img')?.getAttribute('src')).toEqual(
      'https://cms.example.test/slide_one.jpg'
    )
  })

  test('link back to the profile learn list', () => {
    // act
    const page = harness.routeNativeElement

    // assert
    expect(page?.querySelector('article a')?.getAttribute('href')).toEqual(
      '/profiles/estellise/learn'
    )
    expect(page?.querySelectorAll('article a[href="/profiles/estellise/learn"]').length).toEqual(2)
  })

  test('fall back to the initials and skip what the cms left empty', async () => {
    // act
    await harness.navigateByUrl('/profiles/estellise/learn/bare-review', LearnItem)
    const page = harness.routeNativeElement

    // assert
    expect(page?.querySelector('h1')?.textContent?.trim()).toEqual('Bare Review')
    expect(page?.querySelector('article span.bg-primary')?.textContent?.trim()).toEqual('CC')
    expect(page?.textContent).toContain('Jan 2026')
    expect(page?.textContent).not.toContain('IN ONE SENTENCE')
    expect(page?.querySelector('article > img')).toBeNull()
    expect(page?.querySelector('app-block-list')).toBeNull()
  })

  test('render the not-found copy when the cms has no review', async () => {
    // act
    await harness.navigateByUrl('/profiles/estellise/learn/missing', LearnItem)

    // assert
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain(
      'Learning not found'
    )
    expect(harness.routeNativeElement?.querySelector('section a')?.getAttribute('href')).toEqual(
      '/profiles/estellise/learn'
    )
  })
})
