import { contactWriteAllowed } from '@/lib/contact-limit'
import { isSafeHref, unsafePublicUrl } from '@/lib/footer-config'
import { feedKeepIds, shouldPruneInstagram } from '@/lib/instagram-keep'
import { sanitizeHtml } from '@/lib/sanitize'
import { isUpcomingEvent } from '@/lib/upcoming'

let failed = 0

function check(label: string, ok: boolean) {
  if (ok) {
    console.log(`  ok  - ${label}`)
    return
  }
  console.error(`  FAIL - ${label}`)
  failed += 1
}

const slash = sanitizeHtml('<img/src=x/onerror=alert(1)>')
check('slash img onerror is not a tag', !slash.includes('onerror') && !slash.includes('<img'))

const entity = sanitizeHtml('<a href="javascript&#58;alert(1)">x</a>')
check('entity javascript href is dropped', !entity.includes('javascript') && !entity.includes('&#58;'))

const kept = sanitizeHtml('<p>Hi <a href="/impressum">Impressum</a></p>')
check('safe relative link kept', kept.includes('href="/impressum"') && kept.includes('<p>'))

const heading = sanitizeHtml('<h4>Haftung</h4><code>nn-locale</code>')
check('legal h4 and code kept', heading.includes('<h4>') && heading.includes('<code>'))

check('javascript href rejected', !isSafeHref('javascript:alert(1)'))
check('https href kept', isSafeHref('https://www.etsy.com/shop/nebulanoirnn'))

const start = Date.parse('2026-10-09T22:00:00+02:00')
check(
  'event with no end stays up an hour later',
  isUpcomingEvent({ startsAt: '2026-10-09T22:00:00+02:00' }, start + 60 * 60 * 1000),
)
check(
  'event with no end is gone after 24h',
  !isUpcomingEvent({ startsAt: '2026-10-09T22:00:00+02:00' }, start + 25 * 60 * 60 * 1000),
)
check('unparseable event is hidden', !isUpcomingEvent({ startsAt: 'not-a-date' }, start))

const nested = '<<x><</x>img src=x onerror=alert(1)>'
check('nested peel does not leave onerror', !sanitizeHtml(sanitizeHtml(nested)).includes('onerror'))
const unclosed = sanitizeHtml('<<x>img src=x onerror=alert(1)')
check('unclosed img peel is not a tag', !unclosed.includes('<'))
const compared = sanitizeHtml('<p>a < b</p>')
check('comparison sign stays text', compared.includes('<p>') && compared.includes('&lt;') && !compared.includes('a < b'))
const deep = sanitizeHtml('<<<<<<<<<x>x>x>x>x>x>x>x>p onclick=alert(1)>x</p>')
check('eight peels are not a live tag', !deep.includes('<'))
const deepLink = sanitizeHtml('<<<<<<<<<x>x>x>x>x>x>x>x>a href="javascript:alert(1)">click</a>')
check('eight peels do not keep a javascript tag', !deepLink.includes('<'))
const shallow = sanitizeHtml('<<x>p onclick=alert(1)>x</p>')
check('two peels strip onclick', shallow === '<p>x</p>')
const longS = sanitizeHtml('<\u017Ftrong onclick=alert(1)>')
check('long-s strong is not a tag', !longS.includes('<'))
check(
  'reel still in the feed is kept',
  feedKeepIds([{ id: '1789' }, { id: '2' }]).includes('1789'),
)
check('imageless feed does not prune', !shouldPruneInstagram(0, ['1789']))
check('stored feed may prune', shouldPruneInstagram(11, ['1789']))
check('limiter down does not store', !contactWriteAllowed('down'))
check('limiter block does not store', !contactWriteAllowed('limited'))
check('bare host is not a safe link', unsafePublicUrl('www.meraluna.de'))
check('empty link is allowed', !unsafePublicUrl(''))
check('https link is allowed', isSafeHref('https://www.meraluna.de') && !unsafePublicUrl('https://www.meraluna.de'))

if (failed > 0) {
  console.error(`\n${failed} guard check(s) failed`)
  process.exit(1)
}
console.log('\nguard checks passed')
