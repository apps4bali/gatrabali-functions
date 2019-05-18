import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

import { fetchCategories, fetchFeed, fetchEntry } from '../request'

admin.initializeApp();

enum EntityType { Category = 'CATEGORY', Feed = 'FEED', Entry = 'ENTRY' }
enum Operation { Write = 'WRITE', Delete = 'DELETE' }
enum Collection { Categories = 'categories', Feeds = 'feeds', Entries = 'entries' }

const entityTypes = [EntityType.Category, EntityType.Feed, EntityType.Entry]
const operations = [Operation.Write, Operation.Delete]
const firestore = admin.firestore()

/**
 * Validate message received from pubsub.
 */
function messageIsValid(message: any): boolean {
    if (message.entity_id === undefined) return false
    if (message.entity_type === undefined || entityTypes.indexOf(message.entity_type) < 0) return false
    if (message.entity_op === undefined || operations.indexOf(message.entity_op) < 0) return false
    return true
}

/**
 * Sync Categories
 * If Operation.Write = Fetch all categories (because Miniflux doesn't provide GET single category API), sync in batch.
 * If Operation.Delete = Delete category by its ID
 */
async function syncCategory(message: any) {
    if (message.entity_op === Operation.Write) {
        return fetchCategories()
            .then(categories => {
                console.log(`About to save ${categories.length} categories...`)
                const batch = firestore.batch()
                categories.forEach(cat => {
                    batch.set(firestore.collection(Collection.Categories).doc(String(cat.id)), cat.toObject())
                });
                return batch.commit()
            })
            .catch(err => console.log(err))
    } else {
        console.log(`About to delete category with id=${message.entity_id}...`)
        return firestore.collection(Collection.Categories).doc(String(message.entity_id)).delete()
    }
}

/**
 * Sync Feed
 * If Operation.Write = Sync feed by its ID
 * If Operation.Delete = Delete feed by its ID
 */
async function syncFeed(message: any) {
    if (message.entity_op === Operation.Write) {
        return fetchFeed(message.entity_id)
            .then(feed => {
                console.log(`About to save feed with id=${feed.id}...`)
                return firestore.collection(Collection.Feeds).doc(String(feed.id)).set(feed.toObject())
            })
            .catch(err => console.log(`Failed to fetch Feed with id=${message.entity_id}, err: ${err.message}`))
    } else {
        console.log(`About to delete feed with id=${message.entity_id}...`)
        return firestore.collection(Collection.Feeds).doc(String(message.entity_id)).delete()
    }
}

/**
 * Sync Entry
 * If Operation.Write = Sync entry by its ID
 * If Operation.Delete = Delete entry by its ID
 */
async function syncEntry(message: any) {
    if (message.entity_op === Operation.Write) {
        return fetchEntry(message.entity_id)
            .then(async entry => {
                // only sync entry that has enclosures AND its an image AND the title is unique in the collection.
                if (entry.enclosures && entry.enclosures[0]['mime_type'].indexOf('image') !== -1) {

                    const querySnapshot = await firestore.collection(Collection.Entries).where('title', '==', entry.title).get();
                    const isUpdate = querySnapshot.docs.filter(doc => doc.id === String(entry.id)).length === 1;
                    if (querySnapshot.empty || isUpdate) {
                        console.log(`About to save entry with id=${entry.id}...`)
                        return firestore.collection(Collection.Entries).doc(String(entry.id)).set(entry.toObject())
                    }
                    console.log(`Entry with id=${entry.id} not synced, duplicate title!`)

                } else {
                    console.log(`Entry with id=${entry.id} not synced, no image enclosures!`)
                }
                return new Promise((resolve, _) => resolve());
            })
            .catch(err => console.log(`Failed to fetch Entry with id=${message.entity_id}, err: ${err.message}`))
    } else {
        console.log(`About to delete entry with id=${message.entity_id}...`)
        return firestore.collection(Collection.Entries).doc(String(message.entity_id)).delete()
    }
}

/**
 * Data Syncer
 */
export const DataSyncer = functions.pubsub.topic("SyncData").onPublish((message, context) => {
    console.log(`DataSyncer triggered at: ${context.timestamp}, message: ${JSON.stringify(message.json)}`)

    const msg = message.json
    if (!messageIsValid(msg)) {
        console.log(`Message invalid: ${JSON.stringify(msg)}`)
        return false
    }

    switch (msg.entity_type) {
        case EntityType.Category: return syncCategory(msg)
        case EntityType.Feed: return syncFeed(msg)
        case EntityType.Entry: return syncEntry(msg)
    }
    return true
})
