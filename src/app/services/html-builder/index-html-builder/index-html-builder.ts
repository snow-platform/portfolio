import { Service } from '@angular/core'
import { HtmlBuilder } from '../html-builder'

/**
 * Legend
 *  delimiter = ' '
 *  format = 'text <<class1,"text">> text <<class1,class2,"text">>'
 *  example:
 *    A <<text-primary,"machine">> brewing <<text-secondary,text-sm,"coffee">>
 *  output:
 *    A <span class="text-primary">machine</span> brewing <span class="text-secondary text-sm">coffee</span>
 */

@Service()
export class IndexHtmlBuilder implements HtmlBuilder {
  buildHtml(text: string, delimiter = ' '): string {
    const tokens = text.split(delimiter)
    const html = []

    for (const token of tokens) {
      if (token.startsWith('<<') && token.endsWith('>>')) {
        const matches = token.match(/"[^"]*"|[0-9A-Za-z_-]+/g)

        if (!matches) {
          html.push(`<<Error Parsing = ${token}>>`)
          continue
        }

        // first to second last item is a css class
        // last item is a text
        html.push(
          `<span class="${matches.slice(0, -1).join(' ')}">${matches.pop()?.slice(1, -1).replace(/<>/g, ' ')}</span>`
        )
      } else {
        html.push(token)
      }
    }

    return html.join(' ')
  }
}
