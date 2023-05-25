interface PlaylistInfo {
  id: string
  index: number
  title: string
  isCurrent: boolean
  itemCount: number
  totalTime: number
}

interface Environment {
  fetch: WindowOrWorkerGlobalScope['fetch'] | typeof import('undici')['fetch']
  EventSource: typeof EventSource
}

declare module 'eventsource' {
  export default EventSource
}
