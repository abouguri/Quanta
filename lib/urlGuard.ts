import { lookup } from 'dns/promises'
import { isIP } from 'net'

/**
 * Thrown when a caller-supplied URL is not safe to fetch server-side.
 * The message is written to be shown to the user directly.
 */
export class UnsafeUrlError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnsafeUrlError'
  }
}

const BLOCKED_HOSTNAMES = new Set(['localhost', 'metadata.google.internal', 'metadata'])

/** Hostnames that resolve inside a private network by convention. */
const BLOCKED_SUFFIXES = ['.localhost', '.local', '.internal', '.home.arpa']

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some(p => !Number.isInteger(p) || p < 0 || p > 255)) return true
  const [a, b] = parts

  if (a === 0) return true                       // 0.0.0.0/8 "this network"
  if (a === 10) return true                      // private
  if (a === 127) return true                     // loopback
  if (a === 169 && b === 254) return true        // link-local — cloud metadata lives here
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  if (a === 100 && b >= 64 && b <= 127) return true // carrier-grade NAT
  if (a === 192 && b === 0) return true           // IETF protocol assignments
  if (a >= 224) return true                       // multicast + reserved + broadcast
  return false
}

function isPrivateIPv6(ip: string): boolean {
  const addr = ip.toLowerCase().replace(/^\[|\]$/g, '').split('%')[0]
  if (addr === '::' || addr === '::1') return true
  if (addr.startsWith('fc') || addr.startsWith('fd')) return true  // unique local
  if (addr.startsWith('fe80')) return true                          // link-local
  if (addr.startsWith('ff')) return true                            // multicast

  // IPv4-mapped (::ffff:169.254.169.254) tunnels straight past an IPv6-only check.
  const mapped = addr.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) return isPrivateIPv4(mapped[1])
  return false
}

export function isPrivateAddress(ip: string): boolean {
  const family = isIP(ip)
  if (family === 4) return isPrivateIPv4(ip)
  if (family === 6) return isPrivateIPv6(ip)
  return true // not an IP we understand — refuse rather than guess
}

/**
 * Validates a caller-supplied article URL before we fetch it.
 *
 * The analyze endpoint fetches whatever URL it is handed, from inside our
 * infrastructure, and returns the body's text to the caller. Without this
 * check that is a server-side request forgery primitive: `http://169.254.169.254/`
 * would hand back cloud instance metadata as an "article".
 *
 * DNS is resolved here so that a public hostname pointing at 127.0.0.1 is
 * rejected too. There is still a TOCTOU gap between this lookup and the
 * fetch — closing it entirely needs a pinned-IP agent, which is more than a
 * read-only scraper warrants.
 */
export async function assertSafeUrl(rawUrl: string): Promise<URL> {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new UnsafeUrlError('That does not look like a valid URL.')
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new UnsafeUrlError('Only http and https URLs can be analyzed.')
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, '')
  if (!hostname) throw new UnsafeUrlError('That URL has no hostname.')

  if (BLOCKED_HOSTNAMES.has(hostname) || BLOCKED_SUFFIXES.some(s => hostname.endsWith(s))) {
    throw new UnsafeUrlError('That URL points at a private address.')
  }

  // Bare IP literals never need DNS, and `new URL` keeps IPv6 in brackets.
  const literal = hostname.replace(/^\[|\]$/g, '')
  if (isIP(literal)) {
    if (isPrivateAddress(literal)) throw new UnsafeUrlError('That URL points at a private address.')
    return url
  }

  let addresses: Array<{ address: string }>
  try {
    addresses = await lookup(hostname, { all: true })
  } catch {
    throw new UnsafeUrlError(`Could not resolve ${hostname}.`)
  }

  if (addresses.length === 0) throw new UnsafeUrlError(`Could not resolve ${hostname}.`)
  // Every record must be public: one private answer in a round-robin set is
  // enough for the fetch to land somewhere it should not.
  if (addresses.some(a => isPrivateAddress(a.address))) {
    throw new UnsafeUrlError('That URL resolves to a private address.')
  }

  return url
}
