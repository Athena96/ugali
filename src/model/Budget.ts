import { Category } from "./Category"





export class Budget {
    id: string
    title: string
    date: Date
    createdAt:Date
    updatedAt: Date
    user: string
    categories: Category[]

    constructor(
        id: string,
        title: string,
        date: Date,
        createdAt:Date,
        updatedAt: Date,
        user: string,
        categories: Category[]
        ) {
            this.id = id
            this.title = title
            this.date = date
            this.createdAt = createdAt
            this.updatedAt =  updatedAt
            this.user = user
            this.categories = categories
    }

}

