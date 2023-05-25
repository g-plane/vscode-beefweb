import { createNanoEvents } from 'nanoevents'

export class PlayerController {
  public eventBus = createNanoEvents()
  private uri: string
  private eventSource: EventSource

  constructor(
    private env: Environment,
    host: string = '127.0.0.1',
    port: number = 8880
  ) {
    this.uri = `http://${host}:${port}/api`

    const eventSource = new this.env.EventSource(
      `${this.uri}/query/updates?player=true&trcolumns=%25artist%25%20-%20%25title%25`
    )
    eventSource.addEventListener('message', ({ data }) => {
      const { player } = JSON.parse(data)
      if (
        player &&
        (player.activeItem.columns[0] || player.playbackState === 'stopped')
      ) {
        this.eventBus.emit('statusChanged', {
          playbackState: player.playbackState,
          song: player.activeItem.columns[0],
        })
      }
    })
    this.eventSource = eventSource
  }

  private async sendPOST(uri: string) {
    try {
      return await this.env.fetch(this.uri + uri, {
        method: 'POST',
        mode: 'cors',
      })
    } catch (error) {
      this.eventBus.emit('error', error)
    }
  }

  private async getData(uri: string) {
    try {
      const response = await this.env.fetch(this.uri + uri, { mode: 'cors' })
      return response.json()
    } catch (error) {
      this.eventBus.emit('error', error)
    }
  }

  playPrev() {
    this.sendPOST('/player/previous')
  }

  playNext() {
    this.sendPOST('/player/next')
  }

  togglePause() {
    this.sendPOST('/player/pause/toggle')
  }

  play() {
    this.sendPOST('/player/play')
  }

  stop() {
    this.sendPOST('/player/stop')
  }

  async retrievePlaylist(playlistId?: string) {
    const { playlists } = await this.getData('/playlists')
    const { id, itemCount } = playlists.find((playlist: PlaylistInfo) =>
      playlistId ? playlist.id === playlistId : playlist.isCurrent
    )

    const {
      playlistItems: { items },
    } = await this.getData(
      `/playlists/${id}/items/0:${itemCount}?columns=%25artist%25%20-%20%25title%25`
    )
    return items.map((item: { columns: string[] }) => item.columns[0])
  }

  async allPlaylists() {
    const { playlists }: { playlists: PlaylistInfo[] } = await this.getData(
      '/playlists'
    )

    const ret: {
      [key: string]: { title: string; items: string[] }
    } = Object.create(null)

    await Promise.all(
      playlists.map(async ({ id, title }) => {
        ret[id] = {
          title,
          items: await this.retrievePlaylist(id),
        }
      })
    )

    return ret
  }

  async switchSong(index: number, playlist?: string) {
    if (!playlist) {
      const {
        player: {
          activeItem: { playlistId },
        },
      } = await this.getData('/player')
      playlist = playlistId
    }

    return this.sendPOST(`/player/play/${playlist}/${index}`)
  }

  dispose() {
    this.eventBus.events = {}
    this.eventSource.close()
  }
}
