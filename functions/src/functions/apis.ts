import * as functions from 'firebase-functions'
import * as db from '../db'

// By default we cache the content on client and server for 1hr.
function setCacheControl(res, maxAge = 3600, sMaxAge = 3600) {
    res.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${sMaxAge}`)
}

/**
 * API Category news summary
 * Returns summary of news in eacy category/regency.
 */
export const ApiCategoryNewsSummary = functions.https.onRequest((req, res) => {
    return res.json({ api_name: 'ApiCategoryNewsSummary' })
})

/**
 * API news
 * Returns list of news
 */
export const ApiNews = functions.https.onRequest((req, res) => {
    const categoryId = req.query.categoryId
    const cursor = req.query.cursor
    let limit = req.query.limit || 10

    console.log(`ApiNews: ${categoryId}, ${cursor}, ${limit}`)

    // limit the 'limit' to max 20
    if (limit > 20) {
        limit = 20
    }

    if (categoryId) {
        if (parseInt(categoryId) === 0) {
            return res.status(400).send('categoryId is invalid')
        }

        return db.getNewsByCategoryId(categoryId, cursor, limit)
            .then(result => {
                if (result.length > 0) setCacheControl(res)
                res.json(result)
            })
            .catch(_ => res.status(500).send('Internal Server Error'))
    } else {
        return db.getAllNews(cursor, limit)
            .then(result => {
                if (result.length > 0) setCacheControl(res)
                res.json(result)
            })
            .catch(_ => res.status(500).send('Internal Server Error'))
    }
})