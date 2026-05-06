import type { TriggerEvent } from './TriggerEvent';

export type PersonaMode = 'friend' | 'commander';

export interface PersonaContext {
  mode: PersonaMode;
  energyPulse: number;
  triggerEvent: TriggerEvent;
  streakDay: number;
  userName: string;
  activeModule?: string;
}

export interface PersonaResponse {
  message: string;
  mode: PersonaMode;
  triggerEvent: TriggerEvent;
}
