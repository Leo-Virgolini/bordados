export abstract class ProductoBase {

    id!: string;
    nombre!: string;
    descripcion!: string;
    tipoPrenda!: string;
    talle!: string;
    colorPrenda!: string;
    imagen!: string; // puede ser URL o base64
    precio!: number;
    tipo!: 'bordado' | 'customizable'; // para diferenciar rápidamente

    constructor(init?: Partial<ProductoBase>) {
        Object.assign(this, init);
    }

}