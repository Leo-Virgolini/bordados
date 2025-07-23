export class Customer {

    id: string;
    name: string;
    email: string;
    phone: string;
    lastName: string;
    dni: string;
    province: string;
    city: string;
    postalCode: string;
    address: string;
    floorApartment?: string;
    registrationDate?: Date;

    constructor(init?: Partial<Customer>) {
        this.id = init?.id || '';
        this.name = init?.name || '';
        this.email = init?.email || '';
        this.phone = init?.phone || '';
        this.lastName = init?.lastName || '';
        this.dni = init?.dni || '';
        this.province = init?.province || '';
        this.city = init?.city || '';
        this.postalCode = init?.postalCode || '';
        this.address = init?.address || '';
        this.floorApartment = init?.floorApartment;
        this.registrationDate = init?.registrationDate;
    }

    get displayName(): string {
        return this.name;
    }

    get key(): string {
        return this.id;
    }

    get emailDomain(): string {
        return this.email.split('@')[0] || '';
    }

    get emailProvider(): string {
        return this.email.split('@')[1] || '';
    }

    get phoneFormatted(): string {
        const cleaned = this.phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return this.phone;
    }

    validateEmail(): boolean {
        return !!this.email && this.email.includes('@') && this.email.includes('.');
    }

    validateName(): boolean {
        return !!this.name && this.name.trim().length > 0;
    }

    validatePhone(): boolean {
        const cleaned = this.phone.replace(/\D/g, '');
        return cleaned.length >= 10;
    }

    equals(other: Customer): boolean {
        return this.id === other.id;
    }

    toString(): string {
        return this.name;
    }

    get fullName(): string {
        return `${this.name} ${this.lastName}`.trim();
    }

    get completeAddress(): string {
        let address = this.address;
        if (this.floorApartment) {
            address += ` (${this.floorApartment})`;
        }
        return address;
    }

    get completeLocation(): string {
        return `${this.city}, ${this.province} (${this.postalCode})`;
    }

    validate(): boolean {
        return this.validateName() &&
            this.validateEmail() &&
            this.validatePhone() &&
            !!(
                this.lastName &&
                this.dni &&
                this.province &&
                this.city &&
                this.postalCode &&
                this.address
            );
    }

    getRegistrationDays(): number {
        if (!this.registrationDate) return 0;
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - this.registrationDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Additional utility methods
    getValidationErrors(): string[] {
        const errors: string[] = [];

        if (!this.validateName()) {
            errors.push('El nombre es requerido');
        }

        if (!this.validateEmail()) {
            errors.push('El email debe tener un formato válido');
        }

        if (!this.validatePhone()) {
            errors.push('El teléfono debe tener al menos 10 dígitos');
        }

        if (!this.lastName) {
            errors.push('El apellido es requerido');
        }

        if (!this.dni) {
            errors.push('El DNI es requerido');
        }

        if (!this.province) {
            errors.push('La provincia es requerida');
        }

        if (!this.city) {
            errors.push('La localidad es requerida');
        }

        if (!this.postalCode) {
            errors.push('El código postal es requerido');
        }

        if (!this.address) {
            errors.push('La dirección es requerida');
        }

        return errors;
    }

    // Factory methods
    static createCustomer(data: Partial<Customer>): Customer {
        return new Customer(data);
    }

    static createFromPersonData(
        name: string,
        email: string,
        phone: string,
        customerData: Partial<Customer>
    ): Customer {
        return new Customer({
            name,
            email,
            phone,
            ...customerData
        });
    }

    clone(): Customer {
        return new Customer(this);
    }

} 