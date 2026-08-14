import { TestBed } from '@angular/core/testing'
import { provideRouter, withComponentInputBinding } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'

import { Index } from './index'
import { ProfileHero } from '../../models/profile-hero'
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

/** Hero copy carrying the `<<class,"text">>` markers IndexHtmlBuilder expands. */
const profileHero = {
  id: 1,
  profile_id: 'estellise',
  head: 'A <<text-primary,"machine">> brewing coffee',
  text: 'Building <<text-accent,text-sm,"software">> that lasts',
  title: 'Software Engineer',
  state: 'Manila',
  status: 'Open to work'
} as ProfileHero

describe('Index', () => {
  let component: Index
  let harness: RouterTestingHarness

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'profiles/:profileId/hero',
              component: Index,
              data: { profileId: { id: 'estellise' }, profileNavi: navi, profileHero }
            }
          ],
          withComponentInputBinding()
        )
      ]
    })

    harness = await RouterTestingHarness.create()
    component = await harness.navigateByUrl('/profiles/estellise/hero', Index)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  test('join the hero status out of the parts the api filled in', () => {
    // assert
    expect(component.status).toEqual('Software Engineer · Manila · Open to work')
    expect(harness.routeNativeElement?.textContent).toContain(
      'Software Engineer · Manila · Open to work'
    )
  })

  test('expand the hero copy markers into spans', () => {
    // act
    const head = harness.routeNativeElement?.querySelector('h1')

    // assert
    expect(head?.textContent?.trim()).toEqual('A machine brewing coffee')
    expect(head?.querySelector('span')?.getAttribute('class')).toEqual('text-primary')
    expect(component.textHtml).toContain('<span class="text-accent text-sm">software</span>')
  })

  test('link the explore cards to the sections of the resolved profile', () => {
    // act
    const links = Array.from(harness.routeNativeElement?.querySelectorAll('main a') ?? []).map(
      (el) => el.getAttribute('href')
    )

    // assert
    expect(links).toEqual([
      '/profiles/estellise/info',
      '/profiles/estellise/articles',
      '/profiles/estellise/info',
      '/profiles/estellise/career',
      '/profiles/estellise/articles',
      '/profiles/estellise/learn'
    ])
  })
})
