export enum Branch {
  POLICE = 'Policía',
  EMS = 'EMS',
  ARMY = 'Ejército',
  SECRET_UNIT = 'Unidad Secreta'
}

export interface User {
  name: string;
  branch: Branch;
  badgeNumber: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  sender: string;
  type: 'alert' | 'info' | 'critical';
}

export interface RadioChannel {
  id: string;
  name: string;
  frequency: string;
  activeUsers: number;
}

export interface DatabaseRecord {
  id: string;
  name?: string;
  plate?: string;
  owner?: string;
  status: 'clean' | 'wanted' | 'stolen';
  details: string;
  timestamp: Date;
}
