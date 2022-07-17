import { Budget } from "../model/Budget";
import { Category } from "../model/Category";

export function mapBudgetToDDBItem(budget: Budget): {
    id: string,
    title: string,
    date: string,
    createdAt: string,
    updatedAt: string,
    user: string,
    categories?: Array<{
        id?: string | null,
        name?: string | null,
        value?: number | null,
    } | null> | null,
} | null {

    const cats: Array<{
        id?: string | null,
        name?: string | null,
        value?: number | null,
    } | null> = []

    for (const cat of budget.categories) {
        cats.push({
            id: cat.id,
            name: cat.name,
            value: cat.value
        })
    }

    return {
        id: budget.id,
        title: budget.title,
        date: budget.date.toISOString(),
        createdAt: budget.createdAt.toISOString(),
        updatedAt: budget.updatedAt.toISOString(),
        user: budget.user,
        categories: cats
    }
}
export function mapDDBItemToBudget(budget: {
    __typename: "SpendingBudget",
    id: string,
    title: string,
    date: string,
    createdAt: string,
    updatedAt: string,
    user: string,
    categories?: Array<{
        __typename: "Category",
        id?: string | null,
        name?: string | null,
        value?: number | null,
    } | null> | null,
} | null): Budget | undefined {
    if (budget) {
        const categories: Category[] = []
        if (budget.categories && budget.categories !== null && budget.categories !== undefined) {
            for (const cat of budget.categories) {
                const c = new Category(cat!.id!, cat!.name!, cat!.value!)
                categories.push(c)
            }
        }

        return new Budget(
            budget.id,
            budget.title,
            new Date(budget.date) || new Date(),
            new Date(budget.createdAt) || new Date(),
            new Date(budget.updatedAt) || new Date(),
            budget.user,
            categories)

    }

}
