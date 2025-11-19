import { faker } from '@faker-js/faker';
import { User, TimeRecord, Sede } from '../types';

export const generateMockUsers = (): User[] => {
  const users: User[] = [];
  
  // Admin user
  users.push({
    id: '1',
    name: 'Admin',
    lastName: 'Sistema',
    cedula: '12345678',
    email: 'admin@empresa.com',
    phone: '+57 300 123 4567',
    isAdmin: true,
    sedeId: 'sede-a'
  });

  // Fixed test employees with known cedulas
  const testEmployees = [
    { cedula: '11111111', name: 'Juan Carlos', lastName: 'Hernández' },
    { cedula: '22222222', name: 'María Elena', lastName: 'González' },
    { cedula: '33333333', name: 'Carlos Andrés', lastName: 'Osorio' },
    { cedula: '44444444', name: 'Dahiana', lastName: 'Zapata' },
    { cedula: '55555555', name: 'Gabriel', lastName: 'Márquez' }
  ];

  testEmployees.forEach((emp, index) => {
    users.push({
      id: (index + 2).toString(),
      name: emp.name,
      lastName: emp.lastName,
      cedula: emp.cedula,
      email: `${emp.name.toLowerCase().replace(' ', '.')}@empresa.com`,
      phone: faker.phone.number('+57 ### ### ####'),
      isAdmin: false,
      sedeId: faker.helpers.arrayElement(['sede-a', 'sede-b'])
    });
  });

  // Additional random employees
  for (let i = 7; i <= 20; i++) {
    users.push({
      id: i.toString(),
      name: faker.person.firstName(),
      lastName: faker.person.lastName(),
      cedula: faker.string.numeric(8),
      email: faker.internet.email(),
      phone: faker.phone.number('+57 ### ### ####'),
      isAdmin: false,
      sedeId: faker.helpers.arrayElement(['sede-a', 'sede-b'])
    });
  }

  return users;
};

export const generateMockTimeRecords = (): TimeRecord[] => {
  const records: TimeRecord[] = [];
  const users = generateMockUsers();
  
  for (let i = 0; i < 50; i++) {
    const user = faker.helpers.arrayElement(users.filter(u => !u.isAdmin));
    const date = faker.date.recent({ days: 30 });
    
    records.push({
      id: i.toString(),
      employeeId: user.id,
      employeeName: `${user.name} ${user.lastName}`,
      cedula: user.cedula,
      date: date.toISOString().split('T')[0],
      timeIn: faker.date.between({
        from: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 7, 0),
        to: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0)
      }).toTimeString().split(' ')[0].substring(0, 5),
      timeOut: faker.datatype.boolean() ? faker.date.between({
        from: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 0),
        to: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 19, 0)
      }).toTimeString().split(' ')[0].substring(0, 5) : undefined,
      coordinates: `${faker.location.latitude().toFixed(4)}, ${faker.location.longitude().toFixed(4)}`,
      sedeId: user.sedeId
    });
  }

  return records;
};

export const generateMockSedes = (): Sede[] => {
  return [
    {
      id: 'sede-a',
      name: 'Sede A',
      address: 'CataAna',
      coordinates: 'Cra 100 30 501',
      isActive: true
    },
    {
      id: 'sede-b',
      name: 'Sede B',
      address: 'Floresta', 
      coordinates: 'Cra 84 56 11',
      isActive: true
    }
  ];
};
