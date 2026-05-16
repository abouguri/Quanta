import { Readability } from '@mozilla/readability'
import type { ContentMessage, ContentResponse } from '@/lib/messages'
import type { ExtractedArticle } from '@/lib/types'

chrome.runtime.onMessage.addListener((msg: ContentMessage, _sender, sendResponse: (r: ContentResponse) => void) => {
  if (msg?.type !== 'EXTRACT') return false

  try {
    const docClone = document.cloneNode(true) as Document
    const article = new Readability(docClone).parse()
    if (!article || !article.textContent) {
      sendResponse(null)
      return false
    }
    const payload: ExtractedArticle = {
      title: article.title,
      byline: article.byline,
      content: article.content,
      textContent: article.textContent.trim(),
      length: article.length,
      siteName: article.siteName,
      excerpt: article.excerpt,
      lang: article.lang,
      url: window.location.href,
    }
    sendResponse(payload)
  } catch (err) {
    console.error('[Quanta] reader extract failed', err)
    sendResponse(null)
  }
  return false
})
