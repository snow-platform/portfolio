import { Component, computed, input } from '@angular/core'
import { Blocks } from '../../models/cms/blocks'
import { Cover } from '../../models/cms/cover'
import { Reveal } from '../reveal'
import { Slider } from '../slider/slider'
import { media } from '../../services/media/media-src'
import { marked } from 'marked'


type View = {
  kind: string
  key: string
}

type ViewText = View & {
  html: string
}
type ViewQuote = View & {
  title: string
  body: string
}
type ViewSlide = View & {
  files: Cover[]
}
type ViewMedia = View & {
  file: Cover
}

type BlockView = ViewText | ViewQuote | ViewSlide | ViewMedia

@Component({
  selector: 'app-block-list',
  imports: [Reveal, Slider],
  templateUrl: './block-list.html'
})
export class BlockList {
  readonly blocks = input.required<Blocks[]>()

  readonly items = computed(() =>
    this.blocks()
      .map((block) => this._view(block))
      .filter((item) => item !== null)
  )

  readonly media = media

  asViewText(item: BlockView): ViewText | null {
    return item.kind === 'rich-text' ? (item as ViewText) : null
  }

  asViewQuote(item: BlockView): ViewQuote | null {
    return item.kind === 'quote' ? (item as ViewQuote) : null
  }

  asViewSlider(item: BlockView): ViewSlide | null {
    return item.kind === 'slider' ? (item as ViewSlide) : null
  }

  asViewMedia(item: BlockView): ViewMedia | null {
    return item.kind === 'media' ? (item as ViewMedia) : null
  }

  private _view(block: Blocks): BlockView | null {
    const component = block.__component

    if (!component) {
      return null
    }

    if (component === 'shared.rich-text' && block.body) {
      return {
        kind: 'rich-text',
        key: `${block.__component}-${block.id}`,
        html: marked.parse(block.body, { async: false })
      }
    }

    if (component === 'shared.quote' && block.title && block.body) {
      return {
        kind: 'quote',
        key: `${block.__component}-${block.id}`,
        title: block.title,
        body: block.body
      }
    }

    if (component === 'shared.slider' && block.files && block.files.length > 0) {
      return { kind: 'slider', key: `${block.__component}-${block.id}`, files: block.files }
    }

    if (component === 'shared.media' && block.file) {
      return { kind: 'media', key: `${block.__component}-${block.id}`, file: block.file }
    }

    return null
  }
}
