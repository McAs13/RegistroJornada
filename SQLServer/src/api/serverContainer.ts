import { PrismaEmployeeRepository } from '../infrastructure/repositories/PrismaEmployeeRepository';
import { PrismaTimeRecordRepository } from '../infrastructure/repositories/PrismaTimeRecordRepository';
import { PrismaSedeRepository } from '../infrastructure/repositories/PrismaSedeRepository';
import { PrismaUnitOfWork } from '../infrastructure/repositories/PrismaUnitOfWork';
import { BasicOvertimeCalculator } from '../domain/overtime/BasicOvertimeCalculator';
import { NotificationChannelFactory } from '../infrastructure/notifications/NotificationChannelFactory';
import { NotificationPublisher } from '../infrastructure/notifications/NotificationPublisher';
import { AuthService } from '../domain/services/AuthService';
import { EmployeeService } from '../domain/services/EmployeeService';
import { SedeService } from '../domain/services/SedeService';
import { TimeRecordService } from '../domain/services/TimeRecordService';
import { DashboardService } from '../domain/services/DashboardService';
import { ReportService } from '../domain/services/ReportService';

const employeeRepo = new PrismaEmployeeRepository();
const timeRecordRepo = new PrismaTimeRecordRepository();
const sedeRepo = new PrismaSedeRepository();

const uow = new PrismaUnitOfWork(employeeRepo, timeRecordRepo, sedeRepo);
const overtimeCalculator = new BasicOvertimeCalculator();
const notificationFactory = new NotificationChannelFactory();
const notificationPublisher = new NotificationPublisher(notificationFactory);

const authService = new AuthService(employeeRepo);
const employeeService = new EmployeeService(employeeRepo);
const sedeService = new SedeService(sedeRepo);
const timeRecordService = new TimeRecordService(uow, overtimeCalculator, notificationPublisher);
const dashboardService = new DashboardService(uow);
const reportService = new ReportService(uow);

const container = {
  authService,
  employeeService,
  sedeService,
  timeRecordService,
  dashboardService,
  reportService
};

export default container;
