import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-error-helper',
  imports: [CommonModule,
    Message
  ],
  templateUrl: './error-helper.component.html',
  styleUrls: ['./error-helper.component.scss']
})
export class ErrorHelperComponent {

  @Input({ required: true })
  control!: AbstractControl | null;

}
