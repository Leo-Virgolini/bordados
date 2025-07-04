import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Carousel } from 'primeng/carousel';
import { Image } from 'primeng/image';
import { Tag } from 'primeng/tag';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink,
    Card, Button, Carousel, Image, Tag, AnimateOnScrollModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  productos = [{ titulo: 'imagen1', imagen: 'imagen1', descripcion: 'imagen1' }, { titulo: 'imagen1', imagen: 'imagen2', descripcion: 'imagen2' },
  { titulo: 'imagen1', imagen: 'imagen3', descripcion: 'imagen3' }, { titulo: 'imagen1', imagen: 'imagen4', descripcion: 'imagen4' }];

  testimonios: object[] = [{ nombre: 'persona1', comentario: 'testimonio1' }, { nombre: 'persona2', comentario: 'testimonio2' }, { nombre: 'persona3', comentario: 'testimonio3' }];

  getSeverity(inventoryStatus: string): string {

    return '';
  }

}
