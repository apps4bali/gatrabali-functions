import * as admin from 'firebase-admin'

/**
 * Returns all feeds
 */
export async function getFeeds() {
    return admin.firestore().collection('feeds')
        .get()
        .then(snapshot => {
            if (snapshot.empty) return []
            return snapshot.docs.map(doc => doc.data())
        })
        .catch(err => {
            console.log(`[Error] db.getFeeds(), ${err}`)
            return []
        })
}

/**
 * Returns paginated list of feed entry
 * This function should never return an exception, exception are logged and will return empty list.
 * @param cursor 
 * @param limit 
 */
export async function getAllNews(cursor, limit) {
    let query = admin.firestore().collection('entries')
        .orderBy('id', 'desc')
        .limit(parseInt(limit))

    if (cursor) {
        query = query.startAfter(parseInt(cursor))
    }

    return query.get()
        .then(snapshot => {
            if (snapshot.empty) return []
            return snapshot.docs.map(doc => doc.data())
        })
        .catch(err => {
            console.log(`[Error] db.getAllNews(${cursor}, ${limit}), ${err}`)
            return []
        })
}

/**
 * Returns paginated list of feed entry for specified category ID.
 * This function should never return an exception, exception are logged and will return empty list.
 * @param categoryId 
 * @param cursor 
 * @param limit 
 */
export async function getNewsByCategoryId(categoryId, cursor, limit) {
    let query = admin.firestore().collection('entries')
        .where('categories', 'array-contains', parseInt(categoryId))
        .orderBy('id', 'desc')
        .limit(parseInt(limit))

    if (cursor) {
        query = query.startAfter(parseInt(cursor))
    }

    return query.get()
        .then(snapshot => {
            if (snapshot.empty) return []
            return snapshot.docs.map(doc => doc.data())
        })
        .catch(err => {
            console.log(`[Error] db.getNewsByCategoryId(${categoryId}, ${cursor}, ${limit}), ${err}`)
            return []
        })
}

/**
 * Returns summary of a category (the category and top 3 latest news)
 * @param category {id, name}
 */
export async function getCategorySummary(category) {
    return getNewsByCategoryId(category.id, null, 3)
        .then(news => {
            if (news.length === 0) return null
            category.news = news
            return category
        })
        .catch(err => {
            console.log(`[Error] db.getCategorySummary(${category}), ${err}`)
            return null
        })
}

/**
 * Returns list of Category and latest 3 of news in that category.
 */
export async function getCategoryNewsSummary() {

    // Get all categories
    return admin.firestore().collection('categories')
        .orderBy('id')
        .get()
        .then(snapshot => {
            if (snapshot.empty) return []

            const promises = snapshot.docs.map(doc => getCategorySummary(doc.data())) // only get 3 latest news
            return Promise.all(promises)
        })
        .then(results => {
            return results.filter(res => res !== null)
        })
        .catch(err => {
            console.log(`[Error] db.getCategoryNewsSummary(), ${err}`)
            return []
        })
}