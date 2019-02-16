import axios from 'axios'
import { Category, Feed, Entry } from './models'

// TODO: Move variables below to ENV variables
const minifluxHost = "http://localhost:8080"
const minifluxUsername = "admin"
const minifluxPasswd = "password"

const Axios = axios.create({
    baseURL: minifluxHost,
    timeout: 10000, // 10 secs
    auth: {
        username: minifluxUsername,
        password: minifluxPasswd
    },
});

// fetch category list from miniflux 
export async function fetchCategories() {
    return Axios.get(`/v1/categories`)
    .then(resp => {
        const data = resp.data
        if(data.length > 0) {
            return data.map(cat => {
                return new Category(cat)
            })
        } else {
            throw Error('Category is empty')
        }
    })
}

// fetch feed from miniflux
export async function fetchFeed(feedId) {
    return Axios.get(`/v1/feeds/${feedId}`)
    .then(resp => new Feed(resp.data))
    .then(async feed => {
        return Axios.get(`/v1/feeds/${feedId}/icon`)
        .then(resp => {
            const data = resp.data
            return feed.setIcon(data.id, data.mime_type, data.data)
        })
        .catch(err => {
            // if error during fetching the icon, just return the feed without icon.
            return feed
        })
    })
}

// fetch feed entry from miniflux
export async function fetchEntry(entryId) {
    return Axios.get(`/v1/entries/${entryId}`)
    .then(resp => new Entry(resp.data))
}