import { Routes } from '@angular/router'
import { Index } from './page/index'
import { Articles } from './page/articles/articles'
import { ArticlesItem } from './page/articles-item/articles-item'
import { Career } from './page/career/career'
import { ProfilesItem } from './page/profiles-item/profiles-item'
import { Error } from './page/error/error'
import { Profiles } from './page/profiles/profiles'
import { Learn } from './page/learn/learn'
import { LearnItem } from './page/learn-item/learn-item'
import { profileNaviResolver } from './resolvers/profile-resolver/profile-navi-resolver'
import { profileHeroResolver } from './resolvers/profile-resolver/profile-hero-resolver'
import { profileIdResolver } from './resolvers/profile-resolver/profile-id-resolver'
import { profilesCardResolver } from './resolvers/profile-resolver/profiles-card-resolver'
import { indexRandomRedirect } from './redirectFn/index-random-redirect'
import { profilePlusResolver } from './resolvers/profile-resolver/profile-plus-resolver'
import { profileWorkResolver } from './resolvers/profile-resolver/profile-work-resolver'

const profileProfileResolver = {
  profileId: profileIdResolver,
  profileNavi: profileNaviResolver
}

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: indexRandomRedirect
  },
  {
    path: 'profiles',
    component: Profiles,
    title: 'Profile',
    resolve: { paginated: profilesCardResolver }
  },
  {
    path: 'profiles/:profileId/hero',
    component: Index,
    title: 'Hero',
    resolve: {
      ...profileProfileResolver,
      profileHero: profileHeroResolver
    }
  },
  {
    path: 'profiles/:profileId/info',
    component: ProfilesItem,
    title: 'Profile',
    resolve: {
      ...profileProfileResolver,
      profilePlus: profilePlusResolver
    }
  },
  {
    path: 'profiles/:profileId/career',
    component: Career,
    title: 'Work & Projects',
    resolve: {
      ...profileProfileResolver,
      profileWork: profileWorkResolver
    }
  },
  {
    path: 'profiles/:profileId/articles',
    component: Articles,
    title: 'Articles',
    resolve: {
      ...profileProfileResolver
    }
  },
  {
    path: 'profiles/:profileId/articles/:articleId',
    component: ArticlesItem,
    title: 'Article',
    resolve: {
      ...profileProfileResolver
    }
  },
  {
    path: 'profiles/:profileId/learn',
    component: Learn,
    title: 'Learn',
    resolve: {
      ...profileProfileResolver
    }
  },
  {
    path: 'profiles/:profileId/learn/:learnId',
    component: LearnItem,
    title: 'Learn',
    resolve: {
      ...profileProfileResolver
    }
  },
  {
    path: '404',
    component: Error,
    title: 'Page not found',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '404'
  }
]
