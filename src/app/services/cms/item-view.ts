import { Article } from '../../models/cms/article'
import { Blocks } from '../../models/cms/blocks'
import { Review } from '../../models/cms/review'
import { RichTextBlock } from '../../models/cms/blocks/rich-text-block'
import { Tag } from '../../models/cms/tag'
import { DateStr } from '../date/date-str'
import { media } from '../media/media-src'

type Item = Article | Review

const pace = 200
const date = new DateStr()

function blocks(entry: Item | null): Blocks[] {
  return entry?.blocks ?? []
}

function tags(entry: Item | null): Tag[] {
  return entry?.tags ?? []
}

function published(entry: Item | null): string {
  const value = entry?.publishedAt ?? entry?.createdAt ?? null

  return `${date.month(value)} ${date.year(value)}`.trim()
}

function readingTime(entry: Item | null): string {
  const count = (body: string | null) => body?.trim().split(' ').filter(Boolean).length ?? 0
  const words = blocks(entry)
    .filter((block): block is RichTextBlock => block.__component === 'shared.rich-text')
    .reduce((total, block) => total + count(block.body), 0)

  return words ? `${Math.max(1, Math.round(words / pace))} min read` : ''
}

function cover(entry: Item | null): string {
  return media.url(entry?.cover ?? null)
}

function coverAlt(entry: Item | null): string {
  return media.alt(entry?.cover ?? null)
}

function author(entry: Item | null): string {
  return entry?.author?.name ?? ''
}

function avatar(entry: Item | null): string {
  return media.thumbnail(entry?.author?.avatar ?? null)
}

function initials(entry: Item | null): string {
  const names = author(entry).split(' ').filter(Boolean)

  if (names.length < 2) {
    return '@@'
  }

  return `${names[0].slice(0, 1)}${names[1].slice(0, 1)}`.toUpperCase()
}

export const view = {
  blocks,
  tags,
  published,
  readingTime,
  cover,
  coverAlt,
  author,
  avatar,
  initials
}
