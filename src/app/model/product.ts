import { ProductoBase } from "./producto-base";

export class Producto extends ProductoBase {

    stock!: number;
    tags!: string[];
    categoria!: string;
    rating!: number;
    descuento!: number;
    esNuevo!: boolean;
    esDestacado!: boolean;

    constructor(init?: Partial<Producto>) {
        super();
        this.tipo = 'bordado';
        Object.assign(this, init);
    }

    get estado(): string {
        if (this.esNuevo && this.esDestacado) return 'Nuevo y Destacado';
        if (this.esNuevo) return 'Nuevo';
        if (this.esDestacado) return 'Destacado';
        return 'Regular';
    }

}