import { TestBed } from '@angular/core/testing'
import { provideRouter, withComponentInputBinding } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'

import { ArticlesItem } from './articles-item'
import { Article } from '../../models/cms/article'
import { Cover } from '../../models/cms/cover'
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
    url: `https://cms.example.test/${name}.png`,
    alternativeText: alt,
    caption: null,
    width: 750,
    height: 325,
    formats: { thumbnail: { url: `https://cms.example.test/thumbnail_${name}.png` } }
  }) as unknown as Cover

/**
 * A trimmed sample/article.json — the CMS sends every field, a test needs a few.
 * The block order is the authored order, and every block type the dynamic zone
 * can hold appears once, including a slider the CMS left empty.
 */
const article = {
  id: 13,
  title: 'Example Article of Lorem Ipsum',
  description: 'This is an example article used for testing the articles.',
  slug: 'example-article-of-lorem-ipsum',
  createdAt: '2026-08-04T08:33:54.978Z',
  publishedAt: '2026-08-05T15:59:15.117Z',
  cover: upload(14, '125226669_p3', 'A wide cover image'),
  category: { id: 8, name: 'General', slug: 'general' },
  tags: [{ id: 2, name: 'Example', slug: 'example' }],
  author: { id: 3, name: 'Carlo Caballero', avatar: upload(13, '133301699_p0') },
  blocks: [
    {
      id: 25,
      body: '# Introduction\n\nLorem ipsum dolor sit amet.\n\n- Nemo enim\n- Aut odit',
      __component: 'shared.rich-text'
    },
    {
      id: 13,
      title: 'Example',
      body: 'This is just an example article',
      __component: 'shared.quote'
    },
    {
      id: 10,
      files: [upload(16, 'slide_one'), upload(17, 'slide_two')],
      __component: 'shared.slider'
    },
    {
      id: 26,
      body: '# No\n\nWhat I’m about to tell you, is that "NO"!!! happens.',
      __component: 'shared.rich-text'
    },
    { id: 11, file: upload(18, 'inline_media'), __component: 'shared.media' },
    { id: 12, files: [], __component: 'shared.slider' }
  ]
} as unknown as Article

/** The same article as the CMS returns it before anything optional is filled in. */
const bare = {
  id: 14,
  title: 'Bare Article',
  description: null,
  slug: 'bare-article',
  createdAt: '2026-01-09T08:33:54.978Z',
  publishedAt: null,
  cover: null,
  category: null,
  tags: null,
  author: { id: 3, name: 'Carlo Caballero', avatar: null },
  blocks: []
} as unknown as Article

describe('ArticlesItem', () => {
  let component: ArticlesItem
  let harness: RouterTestingHarness

  const route = (path: string, data: Article | null) => ({
    path,
    component: ArticlesItem,
    data: {
      profileId: { id: 'estellise' },
      profileNavi: navi,
      profileArticlesItem: { data }
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

  /** The tag chips of the header — the only `flex-wrap gap-2` row on the page. */
  const tags = () =>
    Array.from(harness.routeNativeElement?.querySelectorAll('.flex-wrap.gap-2 span') ?? []).map(
      (el) => el.textContent?.trim()
    )

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            route('profiles/:profileId/articles/missing', null),
            route('profiles/:profileId/articles/bare-article', bare),
            route('profiles/:profileId/articles/:articleId', article)
          ],
          withComponentInputBinding()
        )
      ]
    })

    harness = await RouterTestingHarness.create()
    component = await harness.navigateByUrl(
      '/profiles/estellise/articles/example-article-of-lorem-ipsum',
      ArticlesItem
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  test('render the header from the resolved article', () => {
    // act
    const page = harness.routeNativeElement

    // assert
    expect(page?.querySelector('h1')?.textContent?.trim()).toEqual('Example Article of Lorem Ipsum')
    expect(page?.textContent).toContain('Aug 2026')
    expect(page?.textContent).toContain('General')
    expect(page?.textContent).toContain('1 min read')
    expect(page?.textContent).toContain('Carlo Caballero')
    expect(page?.textContent).toContain('This is an example article used for testing the articles.')
  })

  test('render the cover, the avatar and the tags of the article', () => {
    // act
    const page = harness.routeNativeElement
    const cover = page?.querySelector('article > img')
    const avatar = page?.querySelector('img[alt="Carlo Caballero"]')

    // assert
    expect(cover?.getAttribute('src')).toEqual('https://cms.example.test/125226669_p3.png')
    expect(cover?.getAttribute('alt')).toEqual('A wide cover image')
    expect(cover?.getAttribute('width')).toEqual('750')
    expect(avatar?.getAttribute('src')).toEqual(
      'https://cms.example.test/thumbnail_133301699_p0.png'
    )
    expect(tags()).toEqual(['Example'])
  })

  test('render the blocks in the order the cms returned them', () => {
    // act
    const body = harness.routeNativeElement?.querySelector('app-block-list')

    // assert
    expect(kinds()).toEqual(['rich-text', 'quote', 'slider', 'rich-text', 'media'])
    expect(body?.querySelector('.prose h1')?.textContent).toEqual('Introduction')
    expect(body?.querySelectorAll('.prose ul li').length).toEqual(2)
    expect(body?.querySelector('blockquote')?.textContent?.trim()).toEqual(
      'This is just an example article'
    )
    expect(body?.querySelector('figcaption')?.textContent?.trim()).toEqual('— Example')
  })

  test('render one slide at a time and drop the empty slider', () => {
    // act
    const slider = harness.routeNativeElement?.querySelector('app-slider')

    // assert
    expect(harness.routeNativeElement?.querySelectorAll('app-slider').length).toEqual(1)
    expect(slider?.querySelectorAll('img').length).toEqual(1)
    expect(slider?.querySelector('img')?.getAttribute('src')).toEqual(
      'https://cms.example.test/slide_one.png'
    )
    expect(slider?.textContent).toContain('1 / 2')
  })

  test('link back to the profile articles list', () => {
    // act
    const page = harness.routeNativeElement

    // assert
    expect(page?.querySelector('article a')?.getAttribute('href')).toEqual(
      '/profiles/estellise/articles'
    )
    expect(page?.querySelectorAll('article a[href="/profiles/estellise/articles"]').length).toEqual(
      2
    )
  })

  test('fall back to the initials and skip what the cms left empty', async () => {
    // act
    await harness.navigateByUrl('/profiles/estellise/articles/bare-article', ArticlesItem)
    const page = harness.routeNativeElement

    // assert
    expect(page?.querySelector('h1')?.textContent?.trim()).toEqual('Bare Article')
    expect(page?.querySelector('article span.bg-primary')?.textContent?.trim()).toEqual('CC')
    expect(page?.textContent).toContain('Jan 2026')
    expect(tags()).toEqual([])
    expect(page?.textContent).not.toContain('min read')
    expect(page?.querySelector('article > img')).toBeNull()
    expect(page?.querySelector('app-block-list')).toBeNull()
  })

  test('render the not-found copy when the cms has no article', async () => {
    // act
    await harness.navigateByUrl('/profiles/estellise/articles/missing', ArticlesItem)

    // assert
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain(
      'Article not found'
    )
    expect(harness.routeNativeElement?.querySelector('section a')?.getAttribute('href')).toEqual(
      '/profiles/estellise/articles'
    )
  })
})
