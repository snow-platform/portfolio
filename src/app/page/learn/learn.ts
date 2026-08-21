import { Component, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { Nav } from '../../shared/nav/nav'
import { Footer } from '../../shared/footer/footer'
import { Pagination } from '../../shared/pagination/pagination'
import { Reveal }                     from '../../shared/reveal'
import { Accent, AccentNext, Colors } from '../../services/color/accent.service'
import { DateStr }                    from '../../services/date/date-str'
import { Review } from '../../models/cms/review'
import { CollectionType } from '../../models/cms/collection-type'
import { MetaPagination } from '../../models/cms/meta-pagination'
import { ProfileId } from '../../models/profile-id'

@Component({
  selector: 'app-learn',
  imports: [Footer, Nav, Pagination, Reveal, RouterLink],
  templateUrl: './learn.html',
  styleUrl: './learn.css'
})
export class Learn {
  readonly accent = new AccentNext(Colors.text, Colors.bg)
  readonly date = new DateStr()

  readonly profileId = input.required<ProfileId>()
  readonly profileLearnings = input.required<CollectionType<Review>>()

  get learnings(): Review[] {
    return this.profileLearnings().data ?? []
  }

  get pagination(): MetaPagination {
    return (
      this.profileLearnings().meta?.pagination ?? {
        page: 1,
        pageSize: 0,
        pageCount: 0,
        total: 0
      }
    )
  }

  get filters(): string[] {
    const names = this.learnings.map((x) => x.category?.name).filter(Boolean) as string[]

    return Array.from(new Set(names))
  }

  published(learning: Review): string {
    const value = learning.publishedAt ?? learning.createdAt

    return `${this.date.month(value)} ${this.date.year(value)}`.trim()
  }
}
