import { createActivator } from './extension'

export const activate = createActivator({ fetch: self.fetch, EventSource })

export function deactivate() {}
