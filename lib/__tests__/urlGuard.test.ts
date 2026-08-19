import { beforeEach, describe, expect, it, vi } from 'vitest'

const lookup = vi.hoisted(() => vi.fn())
vi.mock('dns/promises', () => ({ lookup }))

import { assertSafeUrl, isPrivateAddress, UnsafeUrlError } from '@/lib/urlGuard'

/** Every hostname resolves to this public address unless a test says otherwise. */
const PUBLIC = [{ address: '93.184.216.34' }]

describe('isPrivateAddress', () => {
  it.each([
    '127.0.0.1',
    '10.0.0.1',
    '172.16.0.1',
    '172.31.255.255',
    '192.168.1.1',
    '169.254.169.254', // cloud instance metadata
    '0.0.0.0',
    '100.64.0.1',
    '::1',
    'fd00::1',
    'fe80::1',
    '::ffff:169.254.169.254', // IPv4-mapped metadata address
  ])('rejects %s', ip => {
    expect(isPrivateAddress(ip)).toBe(true)
  })

  it.each(['93.184.216.34', '8.8.8.8', '172.32.0.1', '2606:2800:220:1::'])(
    'allows %s',
    ip => {
      expect(isPrivateAddress(ip)).toBe(false)
    },
  )

  it('rejects anything that is not an IP', () => {
    expect(isPrivateAddress('not-an-ip')).toBe(true)
  })
})

describe('assertSafeUrl', () => {
  beforeEach(() => {
    lookup.mockReset()
    lookup.mockResolvedValue(PUBLIC)
  })

  it('accepts an ordinary article URL', async () => {
    const url = await assertSafeUrl('https://apnews.com/article/abc')
    expect(url.hostname).toBe('apnews.com')
  })

  it('rejects non-http schemes', async () => {
    await expect(assertSafeUrl('file:///etc/passwd')).rejects.toThrow(UnsafeUrlError)
    await expect(assertSafeUrl('gopher://example.com')).rejects.toThrow(/http and https/)
  })

  it('rejects garbage that is not a URL', async () => {
    await expect(assertSafeUrl('just some words')).rejects.toThrow(UnsafeUrlError)
  })

  it('rejects localhost without asking DNS', async () => {
    await expect(assertSafeUrl('http://localhost:3000/x')).rejects.toThrow(/private address/)
    expect(lookup).not.toHaveBeenCalled()
  })

  it('rejects a bare private IP literal', async () => {
    await expect(assertSafeUrl('http://169.254.169.254/latest/meta-data/')).rejects.toThrow(
      /private address/,
    )
    expect(lookup).not.toHaveBeenCalled()
  })

  it('rejects a bracketed IPv6 loopback literal', async () => {
    await expect(assertSafeUrl('http://[::1]/')).rejects.toThrow(/private address/)
  })

  it('rejects a public hostname that resolves to a private address', async () => {
    lookup.mockResolvedValue([{ address: '127.0.0.1' }])
    await expect(assertSafeUrl('https://evil.example.com/')).rejects.toThrow(
      /resolves to a private address/,
    )
  })

  it('rejects when any record in a round-robin set is private', async () => {
    lookup.mockResolvedValue([{ address: '93.184.216.34' }, { address: '10.1.2.3' }])
    await expect(assertSafeUrl('https://evil.example.com/')).rejects.toThrow(
      /resolves to a private address/,
    )
  })

  it('rejects a hostname that will not resolve', async () => {
    lookup.mockRejectedValue(new Error('ENOTFOUND'))
    await expect(assertSafeUrl('https://nope.example/')).rejects.toThrow(/Could not resolve/)
  })

  it('rejects internal-only suffixes', async () => {
    await expect(assertSafeUrl('http://db.internal/')).rejects.toThrow(/private address/)
    await expect(assertSafeUrl('http://printer.local/')).rejects.toThrow(/private address/)
  })
})
