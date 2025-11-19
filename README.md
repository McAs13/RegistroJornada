# RegistroJornada — Proyecto completo (Frontend + Backend)

Aplicación para registrar entradas y salidas de empleados, gestionar empleados y sedes, mostrar un dashboard resumido y exportar reportes. Incluye evidencia por foto, coordenadas y cálculo básico de horas extra.

## Contenido del repositorio
- `GestionJornadaPrototipoFuncional/GestionJornadaPrototipo` — Frontend (React + Vite + TypeScript)  
- `SQLServer` — Backend (Node.js + TypeScript + Express + Prisma, orientado a SQL Server)

---

## Características principales
- Login por cédula (sin contraseña).  
- Gestión de empleados (CRUD).  
- Gestión de sedes (CRUD).  
- Registro de entradas/salidas con:
  - Cédula del empleado
  - Sede
  - Coordenadas ("lat,lon")
  - Foto como evidencia (archivo)
  - Cálculo básico de horas extra al registrar la salida
  - Detección inSite mediante geocerca (~50 m)
- Dashboard: empleados totales, empleados activos hoy, sedes, promedio de horas trabajadas.  
- Exportación de registros a CSV.

---

## Stack técnico

Backend (SQLServer)
- Node.js + TypeScript  
- Express  
- Prisma ORM (SQL Server)  
- Multer (subida de archivos)  
- Generación de CSV para reportes

Frontend (prototipo)
- React + TypeScript  
- Vite  
- Axios  
- Framer Motion  
- Tailwind CSS  
- lucide-react (iconos)

---

## Estructura relevante (resumen)
- `GestionJornadaPrototipoFuncional/GestionJornadaPrototipo/`
  - `src/components/Admin/` — RegistrosSection.tsx, DashboardSection.tsx
  - `src/components/Employee/` — TimeClockForm.tsx
  - `src/contexts/` — AuthContext
  - `src/utils/` — api (cliente HTTP)
  - `src/types/` — tipos/DTOs
- `SQLServer/`
  - `prisma/` — esquema y migraciones
  - `src/`
    - `api/` — rutas / controladores
    - `domain/` — entidades e interfaces
    - `infrastructure/`
      - `prisma/` — cliente Prisma
      - `repositories/` — implementaciones Prisma*
      - `notifications/` — subsistema de notificaciones

---

## Patrones de diseño implementados (evidencia en código)

A continuación se listan los patrones confirmados con fragmentos de código extraídos directamente de los archivos del repositorio.

### Repository
Implementaciones que encapsulan el acceso a la base de datos (Prisma) y exponen operaciones CRUD y consultas especializadas.

PrismaEmployeeRepository.ts
```typescript
import { Employee } from '../../domain/entities/Employee';
import { IEmployeeRepository } from '../../domain/repositories/IEmployeeRepository';
import prisma from '../prisma/client';

export class PrismaEmployeeRepository implements IEmployeeRepository {
  async findByCedula(cedula: string): Promise<Employee | null> {
    return prisma.employee.findUnique({ where: { cedula } }) as any;
  }
  async findById(id: string): Promise<Employee | null> {
    return prisma.employee.findUnique({ where: { id } }) as any;
  }
  async findAll(): Promise<Employee[]> {
    return prisma.employee.findMany() as any;
  }
  async search(term?: string, sedeId?: string): Promise<Employee[]> {
    return prisma.employee.findMany({
      where: {
        AND: [
          term ? {
            OR: [
              { name: { contains: term, mode: 'insensitive' } },
              { lastName: { contains: term, mode: 'insensitive' } },
              { cedula: { contains: term } }
            ]
          } : {},
          sedeId ? { sedeId } : {}
        ]
      }
    }) as any;
  }
  async create(data: Omit<Employee, 'id'>): Promise<Employee> {
    return prisma.employee.create({ data }) as any;
  }
  async update(id: string, data: Partial<Omit<Employee, 'id'>>): Promise<Employee> {
    return prisma.employee.update({ where: { id }, data }) as any;
  }
  async delete(id: string): Promise<void> {
    await prisma.employee.delete({ where: { id } });
  }
}
```

PrismaSedeRepository.ts
```typescript
import { Sede } from '../../domain/entities/Sede';
import { ISedeRepository } from '../../domain/repositories/ISedeRepository';
import prisma from '../prisma/client';

export class PrismaSedeRepository implements ISedeRepository {
  async findById(id: string): Promise<Sede | null> {
    return prisma.sede.findUnique({ where: { id } }) as any;
  }
  async findAll(): Promise<Sede[]> {
    return prisma.sede.findMany() as any;
  }
  async create(data: Omit<Sede, 'id'>): Promise<Sede> {
    return prisma.sede.create({ data }) as any;
  }
  async update(id: string, data: Partial<Omit<Sede, 'id'>>): Promise<Sede> {
    return prisma.sede.update({ where: { id }, data }) as any;
  }
  async delete(id: string): Promise<void> {
    await prisma.sede.delete({ where: { id } });
  }
}
```

PrismaTimeRecordRepository.ts
```typescript
import { ITimeRecordRepository } from '../../domain/repositories/ITimeRecordRepository';
import { TimeRecord } from '../../domain/entities/TimeRecord';
import prisma from '../prisma/client';

export class PrismaTimeRecordRepository implements ITimeRecordRepository {
  async create(data: Omit<TimeRecord, 'id'>): Promise<TimeRecord> {
    return prisma.timeRecord.create({ data: {
      ...data,
      recordType: data.recordType,
    } }) as any;
  }

  async findByDateRange(from: Date, to: Date, sedeId?: string, search?: string): Promise<TimeRecord[]> {
    return prisma.timeRecord.findMany({
      where: {
        timestamp: { gte: from, lte: to },
        sedeId: sedeId || undefined,
        employee: search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { cedula: { contains: search } }
          ]
        } : undefined
      },
      orderBy: { timestamp: 'desc' },
      include: { employee: true, sede: true }
    }) as any;
  }

  async findLastEntryForDay(employeeId: string, day: Date): Promise<TimeRecord | null> {
    const from = new Date(day);
    from.setHours(0,0,0,0);
    const to = new Date(day);
    to.setHours(23,59,59,999);
    return prisma.timeRecord.findFirst({
      where: {
        employeeId,
        recordType: 'entrada',
        timestamp: { gte: from, lte: to }
      },
      orderBy: { timestamp: 'desc' }
    }) as any;
  }
}
```

---

### Unit of Work
Estructura que agrupa referencias a repositorios y expone un método `commit()`.

PrismaUnitOfWork.ts
```typescript
import { IUnitOfWork } from '../../domain/repositories/IUnitOfWork';
import { IEmployeeRepository } from '../../domain/repositories/IEmployeeRepository';
import { ITimeRecordRepository } from '../../domain/repositories/ITimeRecordRepository';
import { ISedeRepository } from '../../domain/repositories/ISedeRepository';

export class PrismaUnitOfWork implements IUnitOfWork {
  employees: IEmployeeRepository;
  timeRecords: ITimeRecordRepository;
  sedes: ISedeRepository;

  constructor(
    employees: IEmployeeRepository,
    timeRecords: ITimeRecordRepository,
    sedes: ISedeRepository
  ) {
    this.employees = employees;
    this.timeRecords = timeRecords;
    this.sedes = sedes;
  }

  async commit(): Promise<void> {
    return;
  }
}
```

---

### Cliente Prisma compartido
Los repositorios reutilizan una instancia común del cliente Prisma:
```typescript
import prisma from '../prisma/client';
```

---

### Separación domain / infrastructure
Los repositorios implementan interfaces y usan entidades de la capa de dominio:
```typescript
import { IEmployeeRepository } from '../../domain/repositories/IEmployeeRepository';
import { Employee } from '../../domain/entities/Employee';
```

---

## Evidencias y puntos clave del frontend

- Uso de React Context para autenticación:
```tsx
import { useAuth } from '../../contexts/AuthContext';
```

- Cliente HTTP centralizado (api wrapper):
```tsx
import api from '../../utils/api';
```

- Uso de tipos/DTOs en componentes:
```tsx
import { TimeRecord, Sede } from '../../types';
```

- Componentes principales:
  - `src/components/Admin/RegistrosSection.tsx`  
  - `src/components/Admin/DashboardSection.tsx`  
  - `src/components/Employee/TimeClockForm.tsx`

---

## Endpoints principales (ejemplos)
- `POST /api/auth/login` — body: `{ "cedula": "12345678" }`  
- `GET /api/employees`  
- `POST /api/employees`  
- `GET /api/sedes`  
- `POST /api/sedes`  
- `GET /api/records`  
- `POST /api/records` — multipart/form-data: `cedula`, `recordType`, `coordinates`, `sedeId`, `photo`  
- `GET /api/dashboard/summary`  
- `GET /api/reports/csv`  

Ajusta la `baseURL` del frontend (`src/utils/api`) hacia el backend (por ejemplo `http://localhost:4000/api`).

---

## Cómo ejecutar

### Backend (SQLServer)
1. Entrar a la carpeta del backend:
```bash
cd SQLServer
```
2. Copiar:
```bash
cp .env.example .env
```
y ajustar `DATABASE_URL` para SQL Server.  
3. Instalar dependencias:
```bash
npm install
```
4. Ejecutar migraciones de Prisma:
```bash
npx prisma migrate dev --name init
```
5. Iniciar en desarrollo:
```bash
npm run dev
```

### Frontend
1. Entrar a la carpeta del frontend:
```bash
cd GestionJornadaPrototipoFuncional/GestionJornadaPrototipo
```
2. Instalar dependencias:
```bash
npm install
```
3. Iniciar servidor de desarrollo:
```bash
npm run dev
```

---

## Archivos clave
- Backend:
  - `SQLServer/src/infrastructure/repositories/PrismaEmployeeRepository.ts`
  - `SQLServer/src/infrastructure/repositories/PrismaSedeRepository.ts`
  - `SQLServer/src/infrastructure/repositories/PrismaTimeRecordRepository.ts`
  - `SQLServer/src/infrastructure/repositories/PrismaUnitOfWork.ts`
  - `SQLServer/src/infrastructure/prisma/client`
  - `SQLServer/src/domain/`
  - `SQLServer/src/api/`
- Frontend:
  - `GestionJornadaPrototipoFuncional/GestionJornadaPrototipo/src/components/`
  - `GestionJornadaPrototipoFuncional/GestionJornadaPrototipo/src/contexts/AuthContext`
  - `GestionJornadaPrototipoFuncional/GestionJornadaPrototipo/src/utils/api`
  - `GestionJornadaPrototipoFuncional/GestionJornadaPrototipo/src/types`

---

## Contribuir
1. Haz fork del repositorio.  
2. Crea una rama `feature/xxx` o `fix/xxx`.  
3. Realiza cambios y pruebas.  
4. Abre un Pull Request describiendo los cambios.

---