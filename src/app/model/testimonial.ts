export class Testimonial {

  id: string;
  name: string; // Customer name for display
  image: string; // Profile image URL
  comment: string; // Review text
  rating: number; // Star rating (1-5)
  date: Date;

  constructor(init?: Partial<Testimonial>) {
    this.id = init?.id || crypto.randomUUID();
    this.name = init?.name || '';
    this.image = init?.image || '';
    this.comment = init?.comment || '';
    this.rating = init?.rating || 0;
    this.date = init?.date || new Date();
  }

  // Helper methods for home view carousel
  get shortComment(): string {
    return this.comment.length > 100
      ? this.comment.substring(0, 100) + '...'
      : this.comment;
  }

  get stars(): number[] {
    return Array.from({ length: this.rating }, (_, i) => i + 1);
  }

  get emptyStars(): number[] {
    return Array.from({ length: 5 - this.rating }, (_, i) => i + 1);
  }

  get formattedDate(): string {
    return this.date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Validation for home view testimonials
  validate(): boolean {
    return !!(
      this.name &&
      this.comment &&
      this.image &&
      this.rating >= 1 &&
      this.rating <= 5
    );
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];

    if (!this.name) {
      errors.push('El nombre del cliente es requerido');
    }

    if (!this.comment) {
      errors.push('El comentario es requerido');
    }

    if (!this.image) {
      errors.push('La imagen del cliente es requerida');
    }

    if (this.rating < 1 || this.rating > 5) {
      errors.push('La calificación debe estar entre 1 y 5');
    }

    return errors;
  }

  // Factory methods for home view testimonials
  static createHomeTestimonial(
    name: string,
    comment: string,
    rating: number,
    image: string
  ): Testimonial {
    return new Testimonial({
      name,
      comment,
      rating,
      image
    });
  }

  static createFeaturedTestimonial(
    name: string,
    comment: string,
    rating: number,
    image: string,
    date?: Date
  ): Testimonial {
    return new Testimonial({
      name,
      comment,
      rating,
      image,
      date: date || new Date()
    });
  }

  // Utility methods for carousel display
  get isHighRating(): boolean {
    return this.rating >= 4;
  }

  get ratingText(): string {
    switch (this.rating) {
      case 5: return 'Excelente';
      case 4: return 'Muy bueno';
      case 3: return 'Bueno';
      case 2: return 'Regular';
      case 1: return 'Malo';
      default: return '';
    }
  }

  get displayName(): string {
    return this.name;
  }

  get profileImage(): string {
    return this.image;
  }

  get reviewText(): string {
    return this.comment;
  }

} 