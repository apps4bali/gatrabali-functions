class Objectify {
    toObject() {
        return Object.assign({}, this)
    }
}

export class Category extends Objectify {
    id: number
    title: string

    constructor(response: any)  {
        super()
        this.id = response.id
        this.title = response.title
    }
}

export class Feed extends Objectify {
    id: number
    user_id: number
    feed_url: string
    site_url: string
    title: string
    category: number
    checked_at: string
    icon_id: number
    icon_mime_type: string
    icon_data: string

    constructor(response: any) {
        super()
        this.id = response.id
        this.user_id = response.user_id
        this.feed_url = response.feed_url
        this.site_url = response.site_url
        this.title = response.title
        this.category = response.category.id
        this.checked_at = response.checked_at
    }

    setIcon(id: number, mime_type: string, data: string) {
        this.icon_id = id
        this.icon_mime_type = mime_type
        this.icon_data = data
        return this
    }
}