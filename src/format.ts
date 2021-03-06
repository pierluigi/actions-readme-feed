import rss from 'rss-parser'

const placeholderRe = /(?<raw>\$\{(?<flag>\d*)(?<verb>.+?)\})/g
const locale = "en-US"
const timezone = "UTC"

export function formatFeeds(feeds:Array<rss.Item>, format:string, startFlag:string, endFlag:string): Array<string> {
    // @ts-ignore
    const fields = [...format.matchAll(placeholderRe)].map((e) => e.groups)
    return [
        startFlag,
        ...feeds.map((feed) => formatFeed(feed, format, fields)),
        endFlag
    ]
}

function formatFeed(feed:rss.Item, format:string, fields: Array<{raw:string, flag:string, verb:string}>): string {
    const feedDate = feed.isoDate ? new Date(feed.isoDate) : undefined

    // TODO: more memory-friendly arg initialize
    const args: { [k: string]: string | undefined } = {
        title: feed.title || '(no title)',
        url: feed.link,
        year: feedDate?.toLocaleString(locale, { timeZone: timezone, year: 'numeric' }),
        month: feedDate?.toLocaleString(locale, { month: 'numeric' }),
        monthshort: feedDate?.toLocaleString(locale, { timeZone: timezone, month: 'short' }),
        monthlong: feedDate?.toLocaleString(locale, { timeZone: timezone, month: 'long' }),
        day: feedDate?.toLocaleString(locale, { timeZone: timezone, day: 'numeric' }),
        date: feedDate?.toLocaleString(locale, { timeZone: timezone })
    }

    return fields.reduce((acc:string, cur:{raw:string, flag:string, verb:string}) => {
        // flag: 2 -> pad to length 2 with space (' ')
        // flag:02 -> pad to length 2 with zero('0')
        const padstring = cur.flag.startsWith('0') ? '0' : ' '
        const padlength = parseInt(cur.flag)
        const argraw = args[cur.verb]
        const arg = padlength ? argraw?.padStart(padlength, padstring) : argraw

        return acc.replace(cur.raw, arg || '')
    }
    , format)
}
