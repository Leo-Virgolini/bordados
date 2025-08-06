import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';

// PrimeNG Components
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Dialog } from 'primeng/dialog';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { ColorPicker } from 'primeng/colorpicker';
import { Checkbox } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { ErrorHelperComponent } from '../../../../shared/error-helper/error-helper.component';
import { HiladosService } from '../../../../services/hilados.service';
import { ThreadColor } from '../../../../models/thread-color';

@Component({
    selector: 'app-hilados-tab',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TableModule,
        Button,
        InputText,
        InputNumber,
        Dialog,
        Card,
        Tag,
        InputGroup,
        InputGroupAddon,
        ColorPicker,
        Checkbox,
        ErrorHelperComponent
    ],
    providers: [],
    templateUrl: './hilados-tab.component.html',
    styleUrl: './hilados-tab.component.scss'
})
export class HiladosTabComponent implements OnInit {

    hiladosColors: ThreadColor[] = [];
    hiladoForm!: FormGroup;

    showHiladoDialog: boolean = false;
    editingHilado: ThreadColor | null = null;
    hiladoLoading: boolean = false;

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private hiladosService: HiladosService
    ) { }

    ngOnInit() {
        this.loadHilados();
        this.initForm();
    }

    private loadHilados(): void {
        this.hiladosService.getHilados().subscribe({
            next: (hilados: ThreadColor[]) => {
                this.hiladosColors = hilados;
            },
            error: (error: any) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los colores de hilados: ' + error.message
                });
            }
        });
    }

    private initForm(): void {
        this.hiladoForm = this.fb.group({
            id: [''], // Added ID field
            name: ['', [Validators.required, Validators.minLength(2)]],
            code: ['#000000', [Validators.required]],
            stock: [0, [Validators.required, Validators.min(0)]],
            active: [true]
        });
    }

    openHiladoDialog(hilado?: ThreadColor): void {
        this.editingHilado = hilado || null;
        if (hilado) {
            this.hiladoForm.patchValue(hilado);
            this.hiladoForm.get('id')?.disable(); // Disable ID field when editing
        } else {
            this.hiladoForm.reset({
                id: '', // Reset ID to empty for new hilados
                active: true,
                code: '#000000',
                stock: 500
            });
            this.hiladoForm.get('id')?.disable(); // Disable ID field for new hilados
        }
        this.showHiladoDialog = true;
    }

    saveHilado(): void {
        if (this.hiladoForm.valid) {
            this.hiladoLoading = true;
            const formValue = this.hiladoForm.getRawValue(); // Use getRawValue to get disabled field values

            if (this.editingHilado) {
                // Update existing
                const updatedHilado = { ...this.editingHilado, ...formValue };
                this.hiladosService.updateHilado(updatedHilado).subscribe({
                    next: (hilado: ThreadColor) => {
                        const index = this.hiladosColors.findIndex(h => h.id === hilado.id);
                        if (index !== -1) {
                            this.hiladosColors[index] = hilado;
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Actualizado',
                            detail: `Color de hilado ID: ${hilado.id} actualizado correctamente`
                        });
                        this.showHiladoDialog = false;
                        this.editingHilado = null;
                        this.hiladoLoading = false;
                    },
                    error: (error: any) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al actualizar el color de hilado: ' + error.message
                        });
                        this.hiladoLoading = false;
                    }
                });
            } else {
                // Create new
                this.hiladosService.createHilado(formValue).subscribe({
                    next: (newHilado: ThreadColor) => {
                        this.hiladosColors.push(newHilado);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Creado',
                            detail: `Color de hilado ID: ${newHilado.id} creado correctamente`
                        });
                        this.showHiladoDialog = false;
                        this.editingHilado = null;
                        this.hiladoLoading = false;
                    },
                    error: (error: any) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al crear el color de hilado: ' + error.message
                        });
                        this.hiladoLoading = false;
                    }
                });
            }
        }
    }

    deleteHilado(hilado: ThreadColor): void {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar el color "${hilado.name}"?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.hiladosService.deleteHilado(hilado.id).subscribe({
                    next: () => {
                        this.hiladosColors = this.hiladosColors.filter(h => h.id !== hilado.id);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Eliminado',
                            detail: 'Color de hilado eliminado correctamente'
                        });
                    },
                    error: (error: any) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al eliminar el color de hilado: ' + error.message
                        });
                    }
                });
            }
        });
    }

    getStockStatus(stock: number): { severity: string; value: string } {
        if (stock === 0) return { severity: 'danger', value: 'Sin stock' };
        if (stock <= 10) return { severity: 'warn', value: 'Stock bajo' };
        return { severity: 'success', value: 'En stock' };
    }

} 