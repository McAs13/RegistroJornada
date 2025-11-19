# Backend Gestión de Jornada Laboral – Versión SQL Server

Este proyecto implementa el backend del _Sistema de Registro de Jornada Laboral_, pensado para integrarse con tu frontend en React.

## Stack técnico

- Node.js + TypeScript
- Express
- Prisma ORM
- Base de datos: sqlserver (`DATABASE_URL`)
- Subida de archivos con Multer
- CSV para exportar reportes

## Características principales

- Login por cédula, validando contra base de datos (sin contraseña).
- Gestión de empleados (CRUD).
- Gestión de sedes (CRUD).
- Registro de entradas y salidas:
  - Cédula del empleado.
  - Sede.
  - Coordenadas (`"lat, lon"`).
  - Foto como evidencia (archivo).
  - Cálculo de si el empleado está **en sitio** (geocerca de 50m).
  - Cálculo básico de horas extra cuando se registra la salida.
- Dashboard con resumen:
  - Empleados totales.
  - Empleados activos hoy.
  - Cantidad de sedes.
  - Promedio de horas trabajadas.
- Exportación de registros a CSV.

## Patrones de diseño implementados

1. **Repository**

   - `PrismaEmployeeRepository`, `PrismaSedeRepository`, `PrismaTimeRecordRepository`
   - Encapsulan el acceso a datos. El resto de la aplicación no conoce detalles de Prisma ni SQL.

2. **Unit of Work**

   - `PrismaUnitOfWork`
   - Expone `employees`, `sedes`, `timeRecords` y un método `commit()`.
   - Permite agrupar operaciones de distintos repositorios bajo una misma unidad lógica de trabajo.

3. **Strategy**

   - Interfaz: `IOvertimeCalculator`
   - Implementación: `BasicOvertimeCalculator`
   - Regla: jornada base de 8 horas. Lo que exceda se considera horas extra.
   - Abierto para agregar otros cálculos (festivos, nocturnos, etc.) sin modificar el código que la usa.

4. **Observer (Publisher/Subscriber)**

   - Interfaz: `INotificationPublisher`
   - Implementación: `NotificationPublisher`
   - Cuando se crea un registro de jornada, el servicio `TimeRecordService` llama
     `notificationPublisher.publishRecordCreated(record)`.
   - Internamente, el publisher obtiene un canal desde la fábrica y envía un mensaje.

5. **Factory Method**
   - `NotificationChannelFactory`
   - Crea instancias de `INotificationChannel` según el `NotificationType`.
   - Actualmente usa `ConsoleNotificationChannel`, pero se pueden agregar canales como Email, Slack, etc.

## Principios SOLID evidenciados

- **S – Single Responsibility**

  - `TimeRecordService`: se encarga de la lógica de negocio para crear registros (coordenadas, inSite, horas extra, notificación).
  - `ReportService`: genera el CSV de registros.
  - `PrismaEmployeeRepository`: sólo maneja acceso a datos de empleados.

- **O – Open/Closed**

  - `IOvertimeCalculator` + `BasicOvertimeCalculator`:
    se pueden agregar nuevas estrategias de cálculo sin modificar `TimeRecordService`.
  - `NotificationChannelFactory`: se pueden agregar nuevos tipos de canales sin tocar el código cliente.

- **L – Liskov Substitution**

  - Cualquier implementación de `INotificationChannel` (consola, email, etc.) puede reemplazar otra
    sin romper el comportamiento esperado: siempre se llama `send(message, payload?)`.

- **I – Interface Segregation**

  - Interfaces de repositorio separadas: `IEmployeeRepository`, `ISedeRepository`, `ITimeRecordRepository`.
    Cada servicio depende sólo de lo que necesita, y no de una súper interfaz gigante.

- **D – Dependency Inversion**
  - Los servicios de dominio (`AuthService`, `EmployeeService`, `TimeRecordService`, etc.) dependen de
    **interfaces** (`IEmployeeRepository`, `IUnitOfWork`, `IOvertimeCalculator`, `INotificationPublisher`),
    no de implementaciones concretas ni de Prisma directamente.
  - El archivo `serverContainer.ts` se encarga de construir las implementaciones y de inyectarlas donde se necesitan.

## Cómo ejecutar

1. Clona o copia este proyecto.
2. Crea un archivo `.env` basado en `.env.example`:
   - Para sqlserver: ajusta `DATABASE_URL` según tu entorno.
3. Instala dependencias:

   ```bash
   npm install
   ```

4. Ejecuta migraciones de Prisma:

   ```bash
   npx prisma migrate dev --name init
   ```

5. Inicia el servidor en modo desarrollo:

   ```bash
   npm run dev
   ```

6. Endpoints principales:

   - `POST /api/auth/login` – body: `{ "cedula": "12345678" }`
   - `GET /api/employees`
   - `POST /api/employees`
   - `GET /api/sedes`
   - `POST /api/sedes`
   - `GET /api/records`
   - `POST /api/records` (multipart/form-data: `cedula`, `recordType`, `coordinates`, `sedeId`, `photo`)
   - `GET /api/dashboard/summary`
   - `GET /api/reports/csv`

Conecta tu frontend a estas rutas ajustando la `baseURL` (por ejemplo, `http://localhost:4000/api`).
