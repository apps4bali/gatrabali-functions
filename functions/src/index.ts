import * as functions from 'firebase-functions'

export const DataSyncer = functions.pubsub.topic("SyncData").onPublish((message, context) => {
    console.log(`DataSyncer triggered at: ${context.timestamp}, message: ${JSON.stringify(message.json)}`);
    // TODO:
    // - Call miniflux API
    // - Cleanup the response
    // - Store to firestore.
    return true
})