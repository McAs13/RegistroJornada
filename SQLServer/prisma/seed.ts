// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Limpiando base de datos...');

    // Limpia en orden correcto para evitar errores por FK
    await prisma.timeRecord.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.sede.deleteMany();

    console.log('Base de datos limpia');
    console.log('Iniciando seed...');

    // 1) SEDES
    const sedePrincipal = await prisma.sede.create({
        data: {
            name: 'Sede Principal',
            address: 'Calle 123 #45-67',
            coordinates: '6.2442, -75.5812',
            isActive: true,
        },
    });

    const sedeNorte = await prisma.sede.create({
        data: {
            name: 'Sede Norte',
            address: 'Avenida 80 #30-20',
            coordinates: '6.2947, -75.5859',
            isActive: true,
        },
    });

    console.log('Sedes listas');

    // 2) EMPLEADOS (10 en total)
    const empleadosData = [
        {
            cedula: '1234567890',
            name: 'Miguel',
            lastName: 'Santa',
            email: 'miguel@empresa.com',
            phone: '3001234567',
            isAdmin: true,
            sedeId: sedePrincipal.id,
        },
        {
            cedula: '2000000001',
            name: 'David',
            lastName: 'Múnera',
            email: 'david@empresa.com',
            phone: '3000000001',
            isAdmin: false,
            sedeId: sedePrincipal.id,
        },
        {
            cedula: '2000000002',
            name: 'Ana',
            lastName: 'López',
            email: 'ana@empresa.com',
            phone: '3000000002',
            isAdmin: false,
            sedeId: sedeNorte.id,
        },
        {
            cedula: '2000000003',
            name: 'Carlos',
            lastName: 'Pérez',
            email: 'carlos@empresa.com',
            phone: '3000000003',
            isAdmin: false,
            sedeId: sedePrincipal.id,
        },
        {
            cedula: '2000000004',
            name: 'Laura',
            lastName: 'Gómez',
            email: 'laura@empresa.com',
            phone: '3000000004',
            isAdmin: false,
            sedeId: sedeNorte.id,
        },
        {
            cedula: '2000000005',
            name: 'Andrés',
            lastName: 'Ramírez',
            email: 'andres@empresa.com',
            phone: '3000000005',
            isAdmin: false,
            sedeId: sedePrincipal.id,
        },
        {
            cedula: '2000000006',
            name: 'Juliana',
            lastName: 'Mejía',
            email: 'juliana@empresa.com',
            phone: '3000000006',
            isAdmin: false,
            sedeId: sedeNorte.id,
        },
        {
            cedula: '2000000007',
            name: 'Santiago',
            lastName: 'Ríos',
            email: 'santiago@empresa.com',
            phone: '3000000007',
            isAdmin: false,
            sedeId: sedePrincipal.id,
        },
        {
            cedula: '2000000008',
            name: 'Paula',
            lastName: 'Hernández',
            email: 'paula@empresa.com',
            phone: '3000000008',
            isAdmin: false,
            sedeId: sedeNorte.id,
        },
        {
            cedula: '2000000009',
            name: 'Felipe',
            lastName: 'Torres',
            email: 'felipe@empresa.com',
            phone: '3000000009',
            isAdmin: false,
            sedeId: sedePrincipal.id,
        },
    ];

    const empleados = [];
    for (const emp of empleadosData) {
        const created = await prisma.employee.upsert({
            where: { cedula: emp.cedula },
            update: {},
            create: emp,
        });
        empleados.push(created);
    }

    console.log(`Empleados listos (${empleados.length} creados)`);

    // 3) REGISTROS DE TIEMPO (últimos 7 días, mínimo 30 registros)
    const today = new Date();

    function withTime(base: Date, hours: number, minutes: number) {
        const d = new Date(base);
        d.setHours(hours, minutes, 0, 0);
        return d;
    }

    // Usamos solo los primeros 5 empleados para generar registros
    const empleadosConRegistros = empleados.slice(0, 5);

    // 7 días hacia atrás (incluyendo hoy)
    // Días anteriores: entrada + salida (completo)
    // Hoy: solo entrada (en progreso)
    for (let offset = 0; offset < 7; offset++) {
        const day = new Date(today);
        day.setDate(today.getDate() - offset);
        const isToday = offset === 0;

        for (const emp of empleadosConRegistros) {
            const sede = emp.sedeId === sedePrincipal.id ? sedePrincipal : sedeNorte;
            const [latStr, lonStr] = (sede.coordinates ?? '0,0')
                .split(',')
                .map((p) => p.trim());
            const lat = parseFloat(latStr) || 0;
            const lon = parseFloat(lonStr) || 0;

            // Entrada entre 7:30 y 9:00 (ligera variación)
            const baseEntradaHora = 8;
            const entradaHora =
                baseEntradaHora + ((emp.id.charCodeAt(0) + offset) % 2); // 8 u 9
            const entradaMinutos =
                ((emp.id.charCodeAt(1) + offset) % 2) === 0 ? 0 : 30; // :00 o :30

            // Salida entre 17:00 y 19:00
            const baseSalidaHora = 17;
            const salidaHora =
                baseSalidaHora + ((emp.id.charCodeAt(2) + offset) % 3); // 17,18,19
            const salidaMinutos =
                ((emp.id.charCodeAt(3) + offset) % 2) === 0 ? 0 : 30;

            const entradaTime = withTime(day, entradaHora, entradaMinutos);
            const salidaTime = withTime(day, salidaHora, salidaMinutos);

            const workedMinutes =
                (salidaTime.getTime() - entradaTime.getTime()) / 1000 / 60;
            const jornadaBase = 8 * 60; // 8 horas
            const overtimeMin = Math.max(
                0,
                Math.round(workedMinutes - jornadaBase)
            );

            // Siempre creamos la ENTRADA
            await prisma.timeRecord.create({
                data: {
                    employeeId: emp.id,
                    sedeId: sede.id,
                    recordType: 'entrada',
                    coordinates: sede.coordinates,
                    latitude: lat,
                    longitude: lon,
                    inSite: true,
                    photoUrl: null,
                    timestamp: entradaTime,
                    overtimeMin: null,
                },
            });

            // Solo creamos la SALIDA si NO es hoy
            if (!isToday) {
                await prisma.timeRecord.create({
                    data: {
                        employeeId: emp.id,
                        sedeId: sede.id,
                        recordType: 'salida',
                        coordinates: sede.coordinates,
                        latitude: lat,
                        longitude: lon,
                        inSite: true,
                        photoUrl: null,
                        timestamp: salidaTime,
                        overtimeMin: overtimeMin > 0 ? overtimeMin : null,
                    },
                });
            }
        }
    }

    console.log('Registros de tiempo listos (últimos 7 días)');
    console.log('Seed completado');
}

main()
    .catch((e) => {
        console.error('Error en seed', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
