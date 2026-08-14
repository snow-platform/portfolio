import { afterNextRender, Component, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { Nav } from '../../shared/nav/nav'
import { Footer } from '../../shared/footer/footer'
import { Reveal } from '../../shared/reveal'
import { BlockList } from '../../shared/block-list/block-list'
import { view } from '../../services/cms/item-view'
import { Article } from '../../models/cms/article'
import { SingleType } from '../../models/cms/single-type'
import { ProfileId } from '../../models/profile-id'

@Component({
  selector: 'app-articles-item',
  imports: [RouterLink, Nav, Footer, Reveal, BlockList],
  templateUrl: './articles-item.html',
  styleUrl: './articles-item.css'
})
export class ArticlesItem {
  readonly profileId = input.required<ProfileId>()
  readonly profileArticlesItem = input.required<SingleType<Article>>()

  readonly view = view

  constructor() {
    afterNextRender(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    })
  }

  get article(): Article | null {
    return this.profileArticlesItem().data
  }
}
