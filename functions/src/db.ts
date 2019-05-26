import * as admin from 'firebase-admin'

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