import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Carousel } from 'primeng/carousel';
import { Image } from 'primeng/image';
import { Tag } from 'primeng/tag';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { Testimonial } from '../../model/testimonial';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink,
    Card, Button, Carousel, Image, Tag, AnimateOnScrollModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  productos = [
    { titulo: 'Remera Clásica Bordada', imagen: 'imagen1', descripcion: 'Remera de algodón premium con bordado personalizado, perfecta para regalos únicos' },
    { titulo: 'Buzo con Capucha Bordado', imagen: 'imagen2', descripcion: 'Buzo oversize con capucha y bordado artesanal, ideal para el invierno' },
    { titulo: 'Remera Oversize Bordada', imagen: 'imagen3', descripcion: 'Remera oversize con diseño bordado exclusivo, comodidad y estilo' },
    { titulo: 'Buzo Frisa Bordado', imagen: 'imagen4', descripcion: 'Buzo de frisa con bordado personalizado, abrigo y personalidad' }
  ];

  testimonios: Testimonial[] = [
    new Testimonial({
      name: 'María González',
      comment: '¡Increíble calidad! El bordado quedó perfecto y la prenda es súper cómoda. Definitivamente volveré a comprar.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      rating: 5
    }),
    new Testimonial({
      name: 'Carlos Rodríguez',
      comment: 'Excelente servicio y rapidez en la entrega. El diseño bordado superó mis expectativas. Muy recomendable!',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 5
    }),
    new Testimonial({
      name: 'Ana Martínez',
      comment: 'Perfecto para regalos personalizados. El proceso fue muy fácil y el resultado espectacular. ¡Gracias!',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      rating: 5
    }),
    new Testimonial({
      name: 'Lucas Fernández',
      comment: 'Calidad premium y atención al detalle increíble. El bordado se ve profesional y la tela es excelente.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 5
    }),
    new Testimonial({
      name: 'Sofía López',
      comment: '¡Me encantó! El diseño quedó exactamente como lo imaginé. La comunicación fue perfecta durante todo el proceso.',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      rating: 5
    })
  ];

  getSeverity(inventoryStatus: string): string {
    return '';
  }

}
