import { Cover } from './cover'

export type Author = {
  id: number
  documentId: string | null
  name: string | null
  email: string | null
  createdAt: string | null
  updatedAt: string | null
  publishedAt: string | null

  avatar: Cover | null
}
