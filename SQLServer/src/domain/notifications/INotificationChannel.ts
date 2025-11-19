export interface INotificationChannel {
  send(message: string, payload?: any): Promise<void>;
}
