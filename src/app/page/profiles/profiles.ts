import { Component, input } from '@angular/core'
import { NavEmpty } from '../../shared/nav-empty/nav-empty'
import { Pagination } from '../../shared/pagination/pagination'
import { Reveal } from '../../shared/reveal'
import { RouterLink } from '@angular/router'
import { FooterEmpty } from '../../shared/footer-empty/footer-empty'
import { ProfileCard } from '../../models/profile-card'
import { Paginated } from '../../models/pagination/paginated'

@Component({
  selector: 'app-profiles',
  imports: [NavEmpty, Pagination, Reveal, RouterLink, FooterEmpty],
  templateUrl: './profiles.html',
  styleUrl: './profiles.css'
})
export class Profiles {
  readonly paginated = input.required<Paginated<ProfileCard>>()

  get profilesCard(): ProfileCard[] {
    return this.paginated().items
  }

  name(card: ProfileCard): string {
    return `${card.first_name ?? ''} ${card.last_name ?? ''}`.trim()
  }

  initial(card: ProfileCard): string {
    const initialF = card.first_name?.slice(0, 1)
    const initialL = card.last_name?.slice(0, 1)

    return `${initialF}${initialL}`.toUpperCase()
  }

  skills(card: ProfileCard): string[] {
    const rank = card.skills?.sort((a, b) => b.proficiency - a.proficiency) ?? []
    const tree = rank.slice(0, 3).map((skill) => skill.name as string)

    if (card.skills?.length && card.skills?.length > 3) {
      return [...tree, '...']
    }

    return tree
  }
}
