export class Accent {
  private readonly _colors
  private _index = 0

  constructor(colors: string[]) {
    this._colors = colors
  }

  get color(): string {
    return this._colors[this._index++ % this._colors.length]
  }
}

export class AccentNext {
  private readonly _length: number
  private readonly _colors: string[][]

  private _index = 0

  constructor(...colors: string[][]) {
    if (colors.length === 0) {
      this._length = 0
      this._colors = []
      return
    }

    const sorted = colors.map((value) => value.length).sort((a, b) => a - b)

    this._length = sorted[0]
    this._colors = colors
  }

  get color(): string[] {
    return this._colors.map((value) => value[this._index])
  }

  next(): AccentNext {
    this._index = Math.floor(Math.random() * this._length)
    return this
  }
}

export const Colors = {
  text: ['text-accent', 'text-primary', 'text-secondary'],
  bg: ['bg-accent', 'bg-primary', 'bg-secondary'],
  bgDoth: [
    'bg-accent shadow-[0_0_12px_oklch(77%_0.152_181.912_/_0.7)]',
    'bg-primary shadow-[0_0_12px_oklch(58%_0.233_277.117_/_0.7)]',
    'bg-secondary shadow-[0_0_12px_oklch(65%_0.241_354.308_/_0.7)]'
  ],
  bgChip: [
    'bg-accent/[0.12] text-accent border-accent/25',
    'bg-primary/[0.16] text-primary border-primary/30',
    'bg-secondary/[0.14] text-secondary border-secondary/30'
  ]
}
