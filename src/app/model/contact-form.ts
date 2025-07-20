export class ContactForm {

    id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    date: Date;

    constructor(init?: Partial<ContactForm>) {
        this.id = init?.id || crypto.randomUUID();
        this.name = init?.name || '';
        this.email = init?.email || '';
        this.phone = init?.phone || '';
        this.subject = init?.subject || '';
        this.message = init?.message || '';
        this.date = init?.date || new Date();
    }

    // Helper methods
    get subjectPreview(): string {
        return this.subject.length > 50
            ? this.subject.substring(0, 50) + '...'
            : this.subject;
    }

    get messagePreview(): string {
        return this.message.length > 100
            ? this.message.substring(0, 100) + '...'
            : this.message;
    }

    get formattedDate(): string {
        return this.date.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    get phoneFormatted(): string {
        const cleaned = this.phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return this.phone;
    }

    // Validation methods
    validateEmail(): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(this.email.trim());
    }

    validateName(): boolean {
        return this.name.trim().length >= 2 && this.name.trim().length <= 100;
    }

    validatePhone(): boolean {
        const cleaned = this.phone.replace(/\D/g, '');
        return cleaned.length >= 10;
    }

    validateSubject(): boolean {
        return this.subject.trim().length >= 5 && this.subject.trim().length <= 200;
    }

    validateMessage(): boolean {
        return this.message.trim().length >= 10 && this.message.trim().length <= 2000;
    }

    validate(): boolean {
        return this.validateName() &&
            this.validateEmail() &&
            this.validatePhone() &&
            this.validateSubject() &&
            this.validateMessage();
    }

    getValidationErrors(): string[] {
        const errors: string[] = [];

        if (!this.validateName()) {
            errors.push('El nombre debe tener entre 2 y 100 caracteres');
        }

        if (!this.validateEmail()) {
            errors.push('El email debe tener un formato válido');
        }

        if (!this.validatePhone()) {
            errors.push('El teléfono debe tener un formato válido');
        }

        if (!this.validateSubject()) {
            errors.push('El asunto debe tener entre 5 y 200 caracteres');
        }

        if (!this.validateMessage()) {
            errors.push('El mensaje debe tener entre 10 y 2000 caracteres');
        }

        return errors;
    }

    // Utility methods
    reset(): void {
        this.name = '';
        this.email = '';
        this.phone = '';
        this.subject = '';
        this.message = '';
        this.date = new Date();
    }

    clone(): ContactForm {
        return new ContactForm(this);
    }

    // Factory methods
    static fromFormData(formData: any): ContactForm {
        return new ContactForm({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: formData.subject,
            message: formData.message
        });
    }

    static createEmpty(): ContactForm {
        return new ContactForm();
    }
} 