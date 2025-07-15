import { ProductoBase } from "./producto-base";

export class CarritoItem {

    producto!: ProductoBase;
    cantidad!: number;

    constructor(init?: Partial<CarritoItem>) {
        Object.assign(this, init);
    }

    get total(): number {
        return this.producto.precio * this.cantidad;
    }

}