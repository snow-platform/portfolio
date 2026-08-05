import { Formats } from './formats'

export type Cover = {
  id: number
  documentId: string | null
  name: string | null
  alternativeText: string | null
  caption: string | null
  focalPoint: string | null
  width: number
  height: number
  hash: string | null
  ext: string | null
  mime: string | null
  size: number
  url: string | null
  previewUrl: string | null
  provider: string | null
  provider_metadata: string | null
  createdAt: string | null
  updatedAt: string | null
  publishedAt: string | null

  formats: Formats | null
}
