export class Category {
    id: string
    name: string
    value: number
    strVal: string

    constructor(id: string, name: string, value: number) {
        this.id = id;
        this.name = name;
        this.value = value;
        this.strVal = value.toFixed(2)
    }

    setValue(newVal: string) {
        this.value = Number(newVal);
        this.strVal = newVal;
    }

}