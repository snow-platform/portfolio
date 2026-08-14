import { Cover } from '../../models/cms/cover'

function url(media: Cover | null): string {
  return media?.url ?? media?.formats?.small?.url ?? media?.formats?.thumbnail?.url ?? ''
}

function thumbnail(media: Cover | null): string {
  return media?.formats?.thumbnail?.url ?? media?.formats?.small?.url ?? media?.url ?? ''
}

function alt(media: Cover | null): string {
  return media?.alternativeText ?? media?.caption ?? ''
}

function caption(media: Cover | null): string {
  return media?.caption ?? ''
}

export const media = {
  url,
  thumbnail,
  alt,
  caption,
}
