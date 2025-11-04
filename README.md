# Backend Ing Civil - API con Arquitectura Limpia y JWT

## Descripción
Backend moderno para la aplicación de Ingeniería Civil implementado con **Clean Architecture**, **principios SOLID**, autenticación JWT y cálculos estructurales avanzados.

## 🏗️ Arquitectura y Principios

### Principios SOLID Aplicados
- **Single Responsibility**: Cada clase tiene una sola responsabilidad
- **Open/Closed**: Código abierto para extensión, cerrado para modificación
- **Liskov Substitution**: Herencias y abstracciones correctas
- **Interface Segregation**: Interfaces específicas y cohesivas
- **Dependency Inversion**: Dependencias inyectadas, no hardcodeadas

### Clean Code y Arquitectura Limpia
- **Separación de responsabilidades** en capas bien definidas
- **Inyección de dependencias** con contenedor DI
- **Validación de entrada** centralizada
- **Manejo de errores** consistente y robusto
- **Logging y monitoreo** integrados

## ✨ Características

### Core Features
- ✅ **Autenticación JWT** con refresh tokens
- ✅ **Arquitectura por capas**: Controllers → Services → Repositories
- ✅ **Inyección de dependencias** automatizada
- ✅ **Validación robusta** de datos de entrada
- ✅ **Manejo centralizado de errores**
- ✅ **Rate limiting** y protección contra ataques
- ✅ **CORS configurado** para frontend Angular

### Módulos de Negocio
- ✅ **Sistema de usuarios** completo
- ✅ **Cálculos estructurales**: Zapata cuadrada aislada y combinada
- ✅ **Gestión de empleados** con autorización
- ✅ **Gestión de solicitudes** protegidas
- ✅ **Pre-cálculos** ingenieriles

### Seguridad
- ✅ **Encriptación de contraseñas** con bcrypt
- ✅ **Tokens JWT seguros** con expiración
- ✅ **Validación de fortaleza** de contraseñas
- ✅ **Rate limiting** por IP
- ✅ **Headers de seguridad** configurados

## Instalación

1. Instalar dependencias:
```bash
cd ing-civil-backend
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```
Editar el archivo `.env` con tus configuraciones.

3. Ejecutar migraciones de base de datos:
```bash
npm run migrate
```

4. Iniciar el servidor:
```bash
npm start
```

## Endpoints de Autenticación

### POST /api/login
Inicia sesión con email y contraseña.

**Body:**
```json
{
  "email": "usuario@email.com",
  "password": "contraseña123"
}
```

**Respuesta exitosa:**
```json
{
  "token": "jwt_token_aqui",
  "user": {
    "id": 1,
    "email": "usuario@email.com",
    "name": "Nombre Usuario"
  }
}
```

### POST /api/register
Registra un nuevo usuario.

**Body:**
```json
{
  "email": "nuevo@email.com",
  "password": "contraseña123",
  "name": "Nombre Completo"
}
```

## Endpoints Protegidos (Requieren JWT)

Para acceder a estos endpoints, incluye el token JWT en el header Authorization:
```
Authorization: Bearer tu_jwt_token_aqui
```

### Empleados
- `GET /api/employees` - Obtener todos los empleados
- `POST /api/employees` - Crear nuevo empleado
- `PUT /api/employees/:id` - Actualizar empleado
- `DELETE /api/employees/:id` - Eliminar empleado

### Solicitudes
- `GET /api/requests` - Obtener todas las solicitudes
- `POST /api/requests` - Crear nueva solicitud
- `PUT /api/requests/:id` - Actualizar solicitud
- `DELETE /api/requests/:id` - Eliminar solicitud

### Cálculos Estructurales
- `/api/pre-calculo/*` - Endpoints de pre-cálculo (protegidos)
- `/api/zapata-combinda/*` - Endpoints de zapata combinada (protegidos)
- `/api/zapata-cuadrada-aislada/*` - Endpoints de zapata cuadrada aislada (protegidos)

## Configuración de Seguridad

### Variables de Entorno Importantes
- `JWT_SECRET`: Clave secreta para firmar los tokens JWT (¡CAMBIAR EN PRODUCCIÓN!)
- `DB_*`: Configuraciones de base de datos

### Seguridad del Token
- Los tokens JWT tienen una duración de 24 horas
- Se incluye información del usuario (id, email, name) en el payload
- Los tokens deben enviarse en el header Authorization con el formato "Bearer token"

## Scripts Disponibles

```bash
npm start          # Iniciar servidor en producción
npm run dev        # Iniciar servidor en modo desarrollo
npm run test       # Ejecutar tests
npm run migrate    # Ejecutar migraciones
```

## Estructura del Proyecto

```
src/
├── app.js                 # Configuración principal de Express
├── server.js             # Punto de entrada del servidor
├── middlewares/
│   └── auth.middleware.js # Middleware JWT
├── models/               # Modelos de Sequelize
├── router/
│   └── router.js        # Configuración de rutas
├── bussines/           # Lógica de negocio
│   ├── login/
│   │   └── servicie/
│   │       └── login-service.js
│   ├── employes/
│   ├── request/
│   └── zapata-*/      # Cálculos estructurales
└── config/            # Configuraciones
```