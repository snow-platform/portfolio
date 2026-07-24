import { Component, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { Nav } from '../../shared/nav/nav'
import { Footer } from '../../shared/footer/footer'
import { Reveal } from '../../shared/reveal'
import { ProfilePlus } from '../../models/profile-plus'
import { ProfileId } from '../../models/profile-id'
import { Accent, Colors } from '../../services/color/accent.service'
import { CareerProject } from '../../models/career-project'
import { DateStr }       from '../../services/date/date-str'

type Skill = {
  category: string
  items: string[]
}

type CareerPurj = {
  id: number
  name: string
}

@Component({
  selector: 'app-profile',
  imports: [RouterLink, Nav, Footer, Reveal],
  templateUrl: './profiles-item.html',
  styleUrl: './profiles-item.css'
})
export class ProfilesItem {
  readonly accent = new Accent(Colors.text)
  readonly date = new DateStr()

  readonly profileId = input.required<ProfileId>()
  readonly profilePlus = input.required<ProfilePlus>()

  get name(): string {
    const p = this.profilePlus()

    return [p.first_name, p.last_name].filter(Boolean).join(' ')
  }

  get klan(): string {
    const p = this.profilePlus()
    return [p.stack, p.title, p.state].filter(Boolean).join(' · ')
  }

  get sill(): Skill[] {
    const p = this.profilePlus()
    const map = new Map<string, string[]>()

    for (const skill of p.skills ?? []) {
      if (!skill.category || !skill.name) {
        continue
      }

      map.set(skill.category, [...(map.get(skill.category) ?? []), skill.name])
    }

    return Array.from(map, ([key, val]) => ({
      category: key,
      items: val
    }))
  }

  purj(value: CareerProject[] | null): CareerPurj[] {
    if (!value) {
      return []
    }

    return value
      .sort((a, b) => b.significance - a.significance)
      .slice(0, 3)
      .map((x) => ({ id: x.id, name: x.title ?? '' }))
  }
}
