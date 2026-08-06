import { Component, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { Nav } from '../../shared/nav/nav'
import { Footer } from '../../shared/footer/footer'
import { Reveal } from '../../shared/reveal'
import { Pagination } from '../../shared/pagination/pagination'
import { Accent, Colors } from '../../services/color/accent.service'
import { DateStr } from '../../services/date/date-str'
import { Article } from '../../models/cms/article'
import { CollectionType } from '../../models/cms/collection-type'
import { MetaPagination } from '../../models/cms/meta-pagination'
import { ProfileId } from '../../models/profile-id'

@Component({
  selector: 'app-articles',
  imports: [RouterLink, Nav, Footer, Reveal, Pagination],
  templateUrl: './articles.html',
  styleUrl: './articles.css'
})
export class Articles {
  readonly accentPub = new Accent(Colors.text)
  readonly accentCat = new Accent(Colors.text)
  readonly date = new DateStr()

  readonly profileId = input.required<ProfileId>()
  readonly profileArticles = input.required<CollectionType<Article>>()

  get articles(): Article[] {
    return this.profileArticles().data ?? []
  }

  get pagination(): MetaPagination {
    return (
      this.profileArticles().meta?.pagination ?? {
        page: 1,
        pageSize: 0,
        pageCount: 0,
        total: 0
      }
    )
  }

  published(article: Article): string {
    const value = article.publishedAt ?? article.createdAt

    return `${this.date.month(value)} ${this.date.year(value)}`.trim()
  }
}
