# Bordados - Sistema de Gestión de Bordados

Una aplicación web moderna para la gestión de bordados, productos personalizables, clientes y pedidos, desarrollada con Angular y PrimeNG.

## 🚀 Tecnologías Utilizadas

### **Frontend Framework**

- **Angular 20.0.6** - Framework principal para aplicaciones web
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

- **Angular CLI 20.0.5** - Herramientas de línea de comandos
- **Jasmine & Karma** - Framework de testing
- **Zone.js 0.15.0** - Gestión de zonas de ejecución

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
│   │   ├── pages/           # Páginas principales
│   │   │   ├── admin/       # Panel de administración
│   │   │   ├── home/        # Página principal
│   │   │   ├── login/       # Página de login
│   │   │   └── ...
│   │   ├── services/        # Servicios de datos
│   │   ├── model/           # Modelos de datos
│   │   ├── shared/          # Componentes compartidos
│   │   └── guards/          # Guards de autenticación
│   ├── assets/              # Recursos estáticos
│   └── styles.scss          # Estilos globales
├── public/                  # Archivos públicos
├── angular.json             # Configuración de Angular
├── package.json             # Dependencias del proyecto
└── tsconfig.json           # Configuración de TypeScript
```

## 🎨 Características Principales

- **Panel de Administración** - Gestión completa de productos, clientes y pedidos
- **Sistema de Autenticación** - Login seguro para administradores
- **Gestión de Productos** - CRUD completo con variantes y personalización
- **Gestión de Clientes** - Base de datos de clientes con historial de pedidos
- **Gestión de Pedidos** - Sistema completo de órdenes con cupones y descuentos
- **Analytics** - Gráficos y estadísticas de ventas
- **Responsive Design** - Interfaz adaptativa para todos los dispositivos

## 🔧 Configuración Avanzada

### **Variables de Entorno**

```bash
# Crear archivo de configuración
cp src/environments/environment.ts src/environments/environment.prod.ts

# Editar configuración de producción
# src/environments/environment.prod.ts
```

### **Optimización de Build**

```bash
# Build con análisis de bundle
ng build --stats-json
npx webpack-bundle-analyzer dist/bordados/stats.json
```

### **Linting y Formateo**

```bash
# Ejecutar linter
ng lint

# Lint con auto-fix
ng lint --fix
```

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
