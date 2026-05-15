import { Branch, RadioChannel } from './types';

export const RADIO_CHANNELS: RadioChannel[] = [
  { id: '1', name: 'Canal General', frequency: '101.1', activeUsers: 12 },
  { id: '2', name: 'Policía Estatal', frequency: '102.5', activeUsers: 8 },
  { id: '3', name: 'Radio EMS', frequency: '103.2', activeUsers: 4 },
  { id: '4', name: 'Comunicaciones Militares', frequency: '104.8', activeUsers: 6 },
  { id: '5', name: 'Frecuencia Encriptada', frequency: '999.9', activeUsers: 2 },
];

export const BRANCH_CONFIG = {
  [Branch.POLICE]: {
    color: 'blue',
    icon: 'Shield',
    access: ['database', 'reports', 'complaints', 'warrants']
  },
  [Branch.EMS]: {
    color: 'red',
    icon: 'HeartPulse',
    access: ['database', 'medicals', 'dispatches']
  },
  [Branch.ARMY]: {
    color: 'emerald',
    icon: 'Trophy',
    access: ['database', 'missions', 'inventory']
  },
  [Branch.SECRET_UNIT]: {
    color: 'zinc',
    icon: 'Eye',
    access: ['database', 'reports', 'complaints', 'warrants', 'intelligence', 'missions']
  }
};
