import * as functions from 'firebase-functions'

/**
 * API Regency news summary
 */
export const ApiRegionNewsSummary = functions.https.onRequest((req, res) => {
    return res.json({ api_name: 'ApiRegionNewsSummary' })
})

/**
 * API Regency news
 */
export const ApiRegencyNews = functions.https.onRequest((req, res) => {
    return res.json({ api_name: 'ApiRegencyNews' })
})