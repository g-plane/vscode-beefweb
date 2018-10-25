import * as EventEmitter from 'events'
import * as http from 'http'

export class PlayerController {
  public eventBus = new EventEmitter()
  private uri: string

  constructor(host: string = '127.0.0.1', port: number = 8880) {
    this.uri = `http://${host}:${port}/api`

    http
      .get(
        `${
          this.uri
        }/query/updates?player=true&trcolumns=%25artist%25%20-%20%25title%25`,
        response => {
          response.setEncoding('utf8')
          response.on('data', data => {
            const { player } = JSON.parse(data.toString().slice(6))
            if (
              player &&
              (player.activeItem.columns[0] ||
                player.playbackState === 'stopped')
            ) {
              this.eventBus.emit('statusChanged', {
                playbackState: player.playbackState,
                song: player.activeItem.columns[0]
              })
            }
          })
          response.on('end', () => this.eventBus.emit('end'))
        }
      )
      .on('error', error => this.eventBus.emit('error', error))
  }

  private sendPOST(uri: string) {
    http
      .request({
        host: '127.0.0.1',
        port: 8880,
        method: 'POST',
        path: `/api${uri}`
      })
      .on('error', error => this.eventBus.emit('error', error))
      .end()
  }

  private getData(uri: string) {
    return new Promise<any>(resolve => {
      http
        .get(this.uri + uri, response => {
          let rawData = ''
          response.setEncoding('utf8')
          response
            .on('data', data => (rawData += data))
            .on('end', () => resolve(JSON.parse(rawData)))
            .on('error', error => this.eventBus.emit('error', error))
        })
        .on('error', error => this.eventBus.emit('error', error))
    })
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

  async retrievePlaylist() {
    const { playlists } = await this.getData('/playlists')
    const { id, itemCount } = playlists.find(
      (playlist: { isCurrent: boolean }) => playlist.isCurrent
    )

    const {
      playlistItems: { items }
    } = await this.getData(
      `/playlists/${id}/items/0:${itemCount}?columns=%25artist%25%20-%20%25title%25`
    )
    return items.map((item: { columns: string[] }) => item.columns[0])
  }

  switchSong(index: number) {
    this.sendPOST(`/player/play/p1/${index}`)
  }

  dispose() {
    this.eventBus.removeAllListeners()
  }
}
