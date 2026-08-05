import { Author }   from './author'
import { Blocks }   from './blocks'
import { Category } from './category'
import { Cover }    from './cover'

export type Review = {
  id: number
  documentId: string | null
  title: string | null
  description: string | null
  slug: string | null
  createdAt: string | null
  updatedAt: string | null
  publishedAt: string | null

  cover: Cover | null
  author: Author | null
  category: Category | null
  blocks: Blocks[] | null
}
