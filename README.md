# Pharmacy POS Frontend

Interfaz profesional para la gestión de farmacias, diseñada para ofrecer una experiencia de usuario fluida y eficiente en el punto de venta.

## Características
- Terminal de Ventas: Conexión directa al microservicio de ventas (FastAPI).
- Catálogo Maestro: Gestión de productos en tiempo real conectada al Core (Django).
- Inventario: Control de lotes y existencias físicas.
- Diseño Responsivo: Optimizado con Tailwind CSS.

## Requisitos
- Node.js 18+
- npm o yarn

## Instalación y Ejecución

1. Clonar el repositorio:
git clone <URL_DE_ESTE_REPO>
cd pharmacy-pos-frontend

2. Instalar dependencias:
npm install

3. Configurar conexiones:
Asegurarse de que el Core de Django esté corriendo en el puerto 8000 y el Microservicio de Ventas en el puerto 8001.

4. Iniciar el entorno de desarrollo:
npm run dev

## Rutas del Sistema
- / : Terminal de Ventas (Punto de Venta).
- /admin : Gestión de catálogo (CRUD de medicinas).
- /admin/stock : Gestión de inventario (CRUD de lotes).

## Tecnologías Utilizadas
- Next.js (App Router)
- Tailwind CSS
- Fetch API para consumo de servicios distribuidos.