export class CarritoItem {

    constructor(
        public id: string,
        public tipo: string,
        public talle: string,
        public colorPrenda: string,
        public colorHilado1: string,
        public imagen: string,
        public cantidad: number,
        public precioUnitario: number,
        public subtotal: number,
        public colorHilado2?: string // opcional
    ) { }

    // get subtotal(): number {
    //     return this.precioUnitario * this.cantidad;
    // }

    // // Opcional: método para formatear el precio como ARS
    // get subtotalFormateado(): string {
    //     return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(this.subtotal);
    // }

}
