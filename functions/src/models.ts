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