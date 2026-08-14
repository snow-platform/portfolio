import { Component, computed, input, signal } from '@angular/core'
import { Cover } from '../../models/cms/cover'
import { media } from '../../services/media/media-src'

@Component({
  selector: 'app-slider',
  templateUrl: './slider.html'
})
export class Slider {
  readonly media = media

  readonly files = input.required<Cover[]>()

  readonly show = computed(() => this.files().length > 0)
  readonly current = signal(0)

  go(index: number): void {
    const min = 0
    const max = this.files().length

    if (index < min || index >= max) return

    this.current.set(index)
  }

  next(): void {
    this.go(this.current() + 1)
  }

  previous(): void {
    this.go(this.current() - 1)
  }
}
