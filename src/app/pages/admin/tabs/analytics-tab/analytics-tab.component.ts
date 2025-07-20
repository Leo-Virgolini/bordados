import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';

// PrimeNG Components
import { Card } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ChartsService } from '../../../../services/charts.service';
import { ChartData, SalesChartData } from '../../../../model/chart-data';

@Component({
    selector: 'app-analytics-tab',
    imports: [
        CommonModule,
        ChartModule,
        Card,
        ProgressSpinner
    ],
    providers: [],
    templateUrl: './analytics-tab.component.html',
    styleUrl: './analytics-tab.component.scss'
})
export class AnalyticsTabComponent implements OnInit {

    // Charts
    salesChartData!: SalesChartData;
    productAnalytics!: ChartData;
    revenueTrend!: ChartData;
    customerGrowth!: ChartData;
    chartsLoading: boolean = false;

    constructor(
        private messageService: MessageService,
        private chartsService: ChartsService
    ) { }

    ngOnInit() {
        this.loadChartsData();
    }

    // Charts Methods
    loadChartsData(): void {
        this.chartsLoading = true;

        // Load sales charts
        this.chartsService.getSalesChartData().subscribe({
            next: (data) => {
                this.salesChartData = data;
                this.chartsLoading = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los gráficos de ventas: ' + error.message
                });
                this.chartsLoading = false;
            }
        });

        // Load product analytics
        this.chartsService.getProductAnalytics().subscribe({
            next: (data) => {
                this.productAnalytics = data;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar el análisis de productos: ' + error.message
                });
            }
        });

        // Load revenue trend
        this.chartsService.getRevenueTrend().subscribe({
            next: (data) => {
                this.revenueTrend = data;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar la tendencia de ingresos: ' + error.message
                });
            }
        });

        // Load customer growth
        this.chartsService.getCustomerGrowth().subscribe({
            next: (data) => {
                this.customerGrowth = data;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar el crecimiento de clientes: ' + error.message
                });
            }
        });
    }

    // Chart Options
    getChartOptions(type: string = 'line', isCurrency: boolean = true): any {
        const baseOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top' as const,
                    labels: {
                        color: '#495057',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#6c757d'
                    },
                    grid: {
                        color: '#e9ecef'
                    }
                },
                y: {
                    ticks: {
                        color: '#6c757d',
                        callback: function (value: any) {
                            if (isCurrency) {
                                return '$' + value.toLocaleString('es-AR');
                            } else {
                                return value.toLocaleString('es-AR');
                            }
                        }
                    },
                    grid: {
                        color: '#e9ecef'
                    }
                }
            }
        };

        if (type === 'doughnut' || type === 'pie') {
            return {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right' as const,
                        labels: {
                            color: '#495057',
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            };
        }

        return baseOptions;
    }

} 