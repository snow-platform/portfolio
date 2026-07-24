export class DateStr {
  month(value: string | null): string {
    if (!value) {
      return ''
    }

    return new Date(value).toLocaleString('default', { month: 'short' })
  }

  year(value: string | null): string {
    if (!value) {
      return ''
    }

    return new Date(value).getFullYear().toString()
  }
}
