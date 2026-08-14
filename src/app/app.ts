import { Component, computed, inject } from '@angular/core'
import { Router, RouterOutlet } from '@angular/router'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly router = inject(Router)

  navigating = computed(() => !!this.router.currentNavigation())
}
