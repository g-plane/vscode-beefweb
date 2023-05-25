import EventSource from 'eventsource'
import { fetch } from 'undici'
import { createActivator } from './extension'

export const activate = createActivator({ fetch, EventSource })

export function deactivate() {}
