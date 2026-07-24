import { Component, input } from '@angular/core'
import { Nav } from '../../shared/nav/nav'
import { Footer } from '../../shared/footer/footer'
import { Reveal } from '../../shared/reveal'
import { Accent, Colors } from '../../services/color/accent.service'
import { DateStr } from '../../services/date/date-str'
import { ProfileCareer } from '../../models/profile-career'
import { CareerProject } from '../../models/career-project'

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
  readonly date = new DateStr()

  readonly profileWork = input.required<ProfileCareer[]>()

  projects(value: CareerProject[] | null): CareerProject[] {
    return [...(value ?? [])].sort((a, b) => b.significance - a.significance)
  }
}
