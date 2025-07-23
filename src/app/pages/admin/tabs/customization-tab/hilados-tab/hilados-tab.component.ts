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
import { ErrorHelperComponent } from '../../../../../shared/error-helper/error-helper.component';
import { HiladosService } from '../../../../../services/hilados.service';
import { ThreadColor } from '../../../../../model/thread-color';

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
    priceForm!: FormGroup;
    showHiladoDialog: boolean = false;
    editingHilado: ThreadColor | null = null;
    hiladoLoading: boolean = false;
    secondColorPrice: number = 0;

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private hiladosService: HiladosService
    ) { }

    ngOnInit() {
        this.loadHilados();
        this.loadSecondColorPrice();
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

    private loadSecondColorPrice(): void {
        this.hiladosService.getSecondColorPrice().subscribe({
            next: (price: number) => {
                this.secondColorPrice = price;
            },
            error: (error: any) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar el precio del segundo color: ' + error.message
                });
            }
        });
    }

    private initForm(): void {
        this.hiladoForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            code: ['#000000', [Validators.required]],
            stock: [0, [Validators.required, Validators.min(0)]],
            active: [true]
        });

        this.priceForm = this.fb.group({
            secondColorPrice: [this.secondColorPrice, [Validators.required, Validators.min(0)]]
        });
    }

    openHiladoDialog(hilado?: ThreadColor): void {
        this.editingHilado = hilado || null;
        if (hilado) {
            this.hiladoForm.patchValue(hilado);
        } else {
            this.hiladoForm.reset({
                active: true,
                code: '#000000',
                stock: 500
            });
        }
        this.showHiladoDialog = true;
    }

    saveHilado(): void {
        if (this.hiladoForm.valid) {
            this.hiladoLoading = true;
            const formValue = this.hiladoForm.value;

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
                            detail: 'Color de hilado actualizado correctamente'
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
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Creado',
                            detail: 'Color de hilado creado correctamente'
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

    saveSecondColorPrice(): void {
        const price = this.priceForm.get('secondColorPrice')?.value;
        if (price !== null && price !== undefined && price >= 0) {
            this.hiladoLoading = true;

            // Add a mini delay for better UX
            setTimeout(() => {
                this.hiladosService.setSecondColorPrice(price).subscribe({
                    next: (savedPrice: number) => {
                        this.secondColorPrice = savedPrice;
                        this.hiladoLoading = false;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Configuración guardada',
                            detail: `Precio por segundo color actualizado a ${savedPrice.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`
                        });
                    },
                    error: (error: any) => {
                        this.hiladoLoading = false;
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al guardar el precio del segundo color: ' + error.message
                        });
                    }
                });
            }, 500); // 500ms delay
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Por favor ingrese un precio válido'
            });
        }
    }
} 