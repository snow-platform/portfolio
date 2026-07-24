import { Component, inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Nav } from '../../shared/nav/nav'
import { Footer } from '../../shared/footer/footer'
import { Reveal } from '../../shared/reveal'
import { DEFAULT_PROFILE_ID, getProfile } from '../../data/portfolio'
import { Accent, Colors } from '../../services/color/accent.service'

@Component({
  selector: 'app-career',
  imports: [Nav, Footer, Reveal],
  templateUrl: './career.html',
  styleUrl: './career.css'
})
export class Career {
  readonly accentText = new Accent(Colors.text)
  readonly accentDoth = new Accent(Colors.bgDoth)
  readonly accentChip = new Accent(Colors.bgChip)

  private route = inject(ActivatedRoute)
  readonly profileId = this.route.snapshot.paramMap.get('profileId') ?? DEFAULT_PROFILE_ID
  readonly p = getProfile(this.profileId)
}
