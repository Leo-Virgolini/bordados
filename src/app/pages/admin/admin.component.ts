import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, RouterLink } from '@angular/router';

// PrimeNG Components
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { Dialog } from 'primeng/dialog';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { ColorPicker } from 'primeng/colorpicker';
import { Checkbox } from 'primeng/checkbox';
import { Textarea } from 'primeng/textarea';
import { Image } from 'primeng/image';
import { FileUpload } from 'primeng/fileupload';
import { Tabs, TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { ErrorHelperComponent } from '../../shared/error-helper/error-helper.component';

// Models
interface HiladoColor {
    id: string;
    nombre: string;
    codigo: string;
    stock: number;
    activo: boolean;
}

interface ProductType {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    talles: string[];
    stock: { [talle: string]: number };
    activo: boolean;
}

@Component({
    selector: 'app-admin',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        TabsModule,
        TableModule,
        Button,
        InputText,
        InputNumber,
        Select,
        MultiSelect,
        Dialog,
        Toast,
        ConfirmDialog,
        Card,
        Tag,
        InputGroup,
        InputGroupAddon,
        ColorPicker,
        Checkbox,
        Textarea,
        Image,
        FileUpload,
        ErrorHelperComponent
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {

    // Hilados Colors Management
    hiladosColors: HiladoColor[] = [];
    hiladoForm!: FormGroup;
    showHiladoDialog: boolean = false;
    editingHilado: HiladoColor | null = null;
    hiladoLoading: boolean = false;

    // Product Types Management
    productTypes: ProductType[] = [];
    productTypeForm!: FormGroup;
    showProductTypeDialog: boolean = false;
    editingProductType: ProductType | null = null;
    productTypeLoading: boolean = false;

    // Common
    loading: boolean = false;
    selectedItems: any[] = [];
    activeTabIndex: string = '0';
    stockControls: { [key: string]: FormControl } = {};

    talles: string[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadMockData();
        this.initForms();
    }

    private loadMockData(): void {
        // Mock Hilados Colors
        this.hiladosColors = [
            { id: '1', nombre: 'Rojo Fuego', codigo: '#FF0000', stock: 150, activo: true },
            { id: '2', nombre: 'Azul Marino', codigo: '#000080', stock: 200, activo: true },
            { id: '3', nombre: 'Verde Bosque', codigo: '#228B22', stock: 120, activo: true },
            { id: '4', nombre: 'Negro', codigo: '#000000', stock: 300, activo: true },
            { id: '5', nombre: 'Blanco', codigo: '#FFFFFF', stock: 250, activo: true }
        ];

        // Mock Product Types
        this.productTypes = [
            {
                id: '1',
                nombre: 'Remera Básica',
                descripcion: 'Remera de algodón 100% con bordado personalizable',
                precio: 15000,
                talles: ['S', 'M', 'L', 'XL'],
                stock: { 'S': 50, 'M': 75, 'L': 60, 'XL': 40 },
                activo: true
            },
            {
                id: '2',
                nombre: 'Buzo con Capucha',
                descripcion: 'Buzo de frisa con capucha y bordado personalizable',
                precio: 25000,
                talles: ['M', 'L', 'XL', 'XXL'],
                stock: { 'M': 30, 'L': 45, 'XL': 35, 'XXL': 25 },
                activo: true
            }
        ];
    }

    private initForms(): void {
        // Hilado Form
        this.hiladoForm = this.fb.group({
            nombre: ['', [Validators.required, Validators.minLength(2)]],
            codigo: ['#000000', [Validators.required]],
            stock: [0, [Validators.required, Validators.min(0)]],
            activo: [true]
        });

        // Product Type Form
        this.productTypeForm = this.fb.group({
            nombre: ['', [Validators.required, Validators.minLength(2)]],
            descripcion: ['', [Validators.required, Validators.minLength(10)]],
            precio: [0, [Validators.required, Validators.min(0)]],
            talles: [[], [Validators.required]],
            stock: this.fb.group({}),
            activo: [true]
        });
    }

    // Hilados Colors CRUD
    openHiladoDialog(hilado?: HiladoColor): void {
        this.editingHilado = hilado || null;
        if (hilado) {
            this.hiladoForm.patchValue(hilado);
        } else {
            this.hiladoForm.reset({ activo: true, codigo: '#000000' });
        }
        this.showHiladoDialog = true;
    }

    saveHilado(): void {
        if (this.hiladoForm.valid) {
            const formValue = this.hiladoForm.value;

            if (this.editingHilado) {
                // Update existing
                const index = this.hiladosColors.findIndex(h => h.id === this.editingHilado!.id);
                this.hiladosColors[index] = { ...this.editingHilado, ...formValue };
                this.messageService.add({
                    severity: 'success',
                    summary: 'Actualizado',
                    detail: 'Color de hilado actualizado correctamente'
                });
            } else {
                // Create new
                const newHilado: HiladoColor = {
                    id: Date.now().toString(),
                    ...formValue
                };
                this.hiladosColors.push(newHilado);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Creado',
                    detail: 'Color de hilado creado correctamente'
                });
            }

            this.showHiladoDialog = false;
            this.editingHilado = null;
        }
    }

    deleteHilado(hilado: HiladoColor): void {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar el color "${hilado.nombre}"?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.hiladosColors = this.hiladosColors.filter(h => h.id !== hilado.id);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Eliminado',
                    detail: 'Color de hilado eliminado correctamente'
                });
            }
        });
    }

    // Product Types CRUD
    openProductTypeDialog(productType?: ProductType): void {
        if (productType) {
            // Create a deep copy to avoid modifying the original object
            this.editingProductType = {
                ...productType,
                stock: { ...productType.stock }
            };

            // Reset form completely first
            this.productTypeForm.reset();

            // Initialize size controls first
            this.initializeSizeControls(this.editingProductType.talles);

            // Create the complete form value including stock
            const formValue = {
                nombre: this.editingProductType.nombre,
                descripcion: this.editingProductType.descripcion,
                precio: this.editingProductType.precio,
                talles: this.editingProductType.talles,
                stock: this.editingProductType.stock,
                activo: this.editingProductType.activo
            };

            this.productTypeForm.patchValue(formValue);
        } else {
            this.editingProductType = null;
            this.productTypeForm.reset({ activo: true, talles: [] });
            this.initializeSizeControls([]);
            this.stockControls = {};
        }
        this.showProductTypeDialog = true;
    }

    private initializeSizeControls(talles: string[]): void {
        const stockControl = this.productTypeForm.get('stock') as FormGroup;

        // Clear existing controls
        Object.keys(stockControl.controls).forEach(key => {
            stockControl.removeControl(key);
        });

        // Add stock controls for each size with default value 0
        talles.forEach(talle => {
            stockControl.addControl(talle, this.fb.control(0, [Validators.required, Validators.min(0)]));
        });
    }

    saveProductType(): void {
        if (this.productTypeForm.valid) {
            const formValue = this.productTypeForm.value;

            if (this.editingProductType) {
                // Update existing
                const index = this.productTypes.findIndex(pt => pt.id === this.editingProductType!.id);
                const updatedProductType = {
                    id: this.editingProductType.id,
                    nombre: formValue.nombre,
                    descripcion: formValue.descripcion,
                    precio: formValue.precio,
                    talles: formValue.talles,
                    stock: { ...formValue.stock }, // Ensure we create a new object
                    activo: formValue.activo
                };

                this.productTypes[index] = updatedProductType;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Actualizado',
                    detail: 'Tipo de producto actualizado correctamente'
                });
            } else {
                // Create new
                const newProductType: ProductType = {
                    id: Date.now().toString(),
                    nombre: formValue.nombre,
                    descripcion: formValue.descripcion,
                    precio: formValue.precio,
                    talles: formValue.talles,
                    stock: { ...formValue.stock }, // Ensure we create a new object
                    activo: formValue.activo
                };
                this.productTypes.push(newProductType);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Creado',
                    detail: 'Tipo de producto creado correctamente'
                });
            }

            this.showProductTypeDialog = false;
            this.editingProductType = null;
        }
    }

    deleteProductType(productType: ProductType): void {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar el tipo "${productType.nombre}"?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.productTypes = this.productTypes.filter(pt => pt.id !== productType.id);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Eliminado',
                    detail: 'Tipo de producto eliminado correctamente'
                });
            }
        });
    }

    onTallesChange(event: any): void {
        const selectedTalles = event.value || [];
        this.initializeSizeControls(selectedTalles);
    }

    getStockControl(talle: string): FormControl {
        const stockGroup = this.productTypeForm.get('stock') as FormGroup;
        return stockGroup.get(talle) as FormControl;
    }

    // Utility methods
    getStockStatus(stock: number): { severity: string; value: string } {
        if (stock === 0) return { severity: 'danger', value: 'Sin stock' };
        if (stock <= 10) return { severity: 'warning', value: 'Stock bajo' };
        return { severity: 'success', value: 'En stock' };
    }

} 