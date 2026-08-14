import { afterNextRender, Component, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { Nav } from '../../shared/nav/nav'
import { Footer } from '../../shared/footer/footer'
import { Reveal } from '../../shared/reveal'
import { BlockList } from '../../shared/block-list/block-list'
import { view } from '../../services/cms/item-view'
import { Review } from '../../models/cms/review'
import { SingleType } from '../../models/cms/single-type'
import { ProfileId } from '../../models/profile-id'

@Component({
  selector: 'app-learn-item',
  imports: [RouterLink, Nav, Footer, Reveal, BlockList],
  templateUrl: './learn-item.html',
  styleUrl: './learn-item.css'
})
export class LearnItem {
  readonly profileId = input.required<ProfileId>()
  readonly profileLearningsItem = input.required<SingleType<Review>>()

  readonly view = view

  constructor() {
    afterNextRender(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    })
  }

  get learning(): Review | null {
    return this.profileLearningsItem().data
  }
}
