# Bordados - Sistema de Gestión de Bordados

Una aplicación web moderna para la gestión de bordados, productos personalizables, clientes y pedidos, desarrollada con Angular y PrimeNG. Sistema completo de e-commerce con personalización avanzada de productos.

## 🚀 Tecnologías Utilizadas

### **Frontend Framework**
- **Angular 20.1.3** - Framework principal para aplicaciones web
- **TypeScript 5.8.3** - Lenguaje de programación tipado
- **RxJS 7.8.0** - Biblioteca para programación reactiva

### **UI Framework & Components**
- **PrimeNG 20.0.0** - Biblioteca de componentes UI para Angular
- **PrimeFlex 4.0.0** - Framework CSS utilitario
- **PrimeIcons 7.0.0** - Iconografía
- **@primeuix/themes 1.2.1** - Temas de PrimeNG

### **Charts & Visualization**
- **Chart.js 4.5.0** - Biblioteca para gráficos y visualizaciones

### **Development Tools**
- **Angular CLI 20.1.3** - Herramientas de línea de comandos
- **Jasmine 5.6.0 & Karma 6.4.0** - Framework de testing
- **Zone.js 0.15.0** - Gestión de zonas de ejecución
- **Concurrently 9.2.0** - Ejecución simultánea de procesos

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:
- **Node.js** (versión 18 o superior)
- **npm** (incluido con Node.js)
- **Angular CLI** (se instala automáticamente con el proyecto)

## 🛠️ Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd bordados
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Verificar Instalación
```bash
ng version
```

## 🚀 Comandos de Desarrollo

### **Iniciar Servidor de Desarrollo**
```bash
# Inicia el servidor y abre automáticamente el navegador
npm start

# O usando Angular CLI directamente
ng serve -o
```

El servidor se ejecutará en `http://localhost:4200/` y se recargará automáticamente cuando hagas cambios.

### **Modo de Desarrollo con Watch**
```bash
# Compila en modo watch para desarrollo
npm run watch

# O usando Angular CLI
ng build --watch --configuration development
```

### **Servidor de Desarrollo Personalizado**
```bash
# Puerto específico
ng serve --port 4300

# Host específico
ng serve --host 0.0.0.0

# Con SSL
ng serve --ssl

# Combinado
ng serve --port 4300 --host 0.0.0.0 --ssl
```

## 🏗️ Comandos de Build

### **Build de Desarrollo**
```bash
# Build básico de desarrollo
ng build

# Build con optimizaciones específicas
ng build --configuration development
```

### **Build de Producción**
```bash
# Build optimizado para producción
ng build --configuration production

# Build con análisis de bundle
ng build --configuration production --stats-json
```

### **Build con Configuraciones Específicas**
```bash
# Build con source maps
ng build --source-map

# Build sin optimizaciones
ng build --optimization false

# Build con configuración personalizada
ng build --configuration staging
```

## 🧪 Testing

### **Ejecutar Tests Unitarios**
```bash
# Ejecutar todos los tests
npm test

# O usando Angular CLI
ng test

# Tests en modo watch
ng test --watch

# Tests con coverage
ng test --code-coverage
```

### **Ejecutar Tests E2E**
```bash
# Ejecutar tests end-to-end
ng e2e

# Tests E2E con configuración específica
ng e2e --configuration production
```

## 📦 Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
npm start

# Build del proyecto
npm run build

# Build en modo watch
npm run watch

# Ejecutar tests
npm test

# Comando Angular CLI
npm run ng
```

## 🏗️ Estructura del Proyecto

```
bordados/
├── src/
│   ├── app/
│   │   ├── pages/                    # Páginas principales
│   │   │   ├── admin/               # Panel de administración
│   │   │   │   └── tabs/            # Pestañas del admin
│   │   │   │       ├── analytics/   # Analytics y estadísticas
│   │   │   │       ├── customers/   # Gestión de clientes
│   │   │   │       ├── hilados/     # Gestión de hilos/colores
│   │   │   │       ├── orders/      # Gestión de pedidos
│   │   │   │       ├── products/    # Gestión de productos
│   │   │   │       └── settings/    # Configuraciones
│   │   │   ├── home/                # Página principal
│   │   │   ├── login/               # Página de login
│   │   │   ├── carrito/             # Carrito de compras
│   │   │   ├── checkout/            # Proceso de compra
│   │   │   ├── contacto/            # Página de contacto
│   │   │   ├── customize/           # Personalización de productos
│   │   │   └── products-sale/       # Catálogo de productos
│   │   ├── services/                # Servicios de datos
│   │   ├── models/                  # Modelos de datos
│   │   ├── shared/                  # Componentes compartidos
│   │   └── guards/                  # Guards de autenticación
│   ├── assets/                      # Recursos estáticos
│   └── styles.scss                  # Estilos globales
├── public/                          # Archivos públicos
│   ├── prendas/                     # Imágenes de prendas
│   ├── productos/                   # Imágenes de productos
│   ├── logos/                       # Logos de la empresa
│   └── icons/                       # Iconos del sistema
├── database/                        # Base de datos JSON
├── angular.json                     # Configuración de Angular
├── package.json                     # Dependencias del proyecto
└── tsconfig.json                   # Configuración de TypeScript
```

## 🎨 Características Principales

### **🛍️ E-commerce Completo**
- **Catálogo de Productos** - Productos bordados y personalizables
- **Carrito de Compras** - Gestión avanzada con productos únicos
- **Proceso de Checkout** - Flujo completo de compra
- **Sistema de Cupones** - Descuentos y promociones

### **🎨 Personalización Avanzada**
- **Productos Personalizables** - Creación de productos únicos
- **Selector de Colores** - Paleta completa de hilos disponibles
- **Texto Personalizado** - Texto con color seleccionable
- **Imágenes Personalizadas** - Subida y preview de imágenes
- **Visualización en Tiempo Real** - Vista previa de personalización

### **👥 Gestión de Clientes**
- **Base de Datos Completa** - Información detallada de clientes
- **Historial de Pedidos** - Seguimiento de compras
- **Validación de Datos** - DNI, email, teléfono
- **Interfaz Moderna** - Diseño con PrimeNG y PrimeFlex

### **📊 Panel de Administración**
- **Dashboard Analytics** - Estadísticas de ventas y métricas
- **Gestión de Productos** - CRUD completo con variantes
- **Gestión de Pedidos** - Estado, seguimiento y detalles
- **Gestión de Clientes** - Base de datos y historial
- **Configuraciones** - Ajustes del sistema

### **🎯 Características Técnicas**
- **Responsive Design** - Adaptable a todos los dispositivos
- **TypeScript Strict** - Tipado fuerte y seguro
- **Reactive Forms** - Formularios reactivos avanzados
- **State Management** - Gestión de estado con RxJS
- **Lazy Loading** - Carga diferida de módulos
- **Error Handling** - Manejo robusto de errores

## 🔧 Características Avanzadas

### **🎨 Sistema de Colores**
- **Paleta Completa** - 6 colores de hilo disponibles
- **Visualización** - Swatches con códigos hex
- **Nombres Descriptivos** - Rojo Fuego, Azul Marino, etc.
- **Contraste Automático** - Texto legible en cualquier color

### **📦 Gestión de Carrito**
- **Productos Únicos** - Cada personalización es única
- **Gestión de Cantidades** - Control de stock
- **Persistencia** - Carrito mantenido entre sesiones
- **Cálculos Automáticos** - Precios y descuentos

### **📋 Gestión de Pedidos**
- **Estados Completo** - Pendiente, Confirmado, En Proceso, etc.
- **Detalles de Personalización** - Colores, texto, imágenes
- **Información de Cliente** - Datos completos y validados
- **Seguimiento** - Historial completo de cambios

### **🎨 Interfaz Moderna**
- **PrimeNG Components** - Componentes de última generación
- **PrimeFlex Utilities** - Framework CSS moderno
- **Iconografía** - Iconos consistentes y descriptivos
- **Temas** - Sistema de temas personalizable

## 🚀 Despliegue

### **Build para Producción**
```bash
# Build optimizado
ng build --configuration production

# Los archivos se generan en dist/bordados/
```

### **Despliegue en Servidor Web**
```bash
# Copiar archivos de dist/bordados/ al servidor web
# Configurar servidor para servir index.html en todas las rutas
```

## 📚 Recursos Adicionales

- [Angular Documentation](https://angular.dev/)
- [PrimeNG Documentation](https://primeng.org/)
- [PrimeFlex Documentation](https://primevue.org/primeflex/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ usando Angular y PrimeNG**
