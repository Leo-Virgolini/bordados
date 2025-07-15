import { ProductoBase } from "./producto-base";

export class ProductoCustomizable extends ProductoBase {

    colorHilado1!: string;
    colorHilado2?: string;
    imagenPersonalizada!: string;

    constructor(init?: Partial<ProductoCustomizable>) {
        super();
        this.tipo = 'customizable';
        Object.assign(this, init);
    }

}