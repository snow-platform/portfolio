import { Meta } from './meta'

export type CollectionType<T> = {
  data: T[] | null
  meta: Meta | null
}
