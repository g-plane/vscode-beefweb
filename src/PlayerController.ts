import * as EventEmitter from 'events'
import * as http from 'http'
import { URL } from 'url'

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
                track: player.activeItem.columns[0]
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
      .request(Object.assign(new URL(`${this.uri}${uri}`), { method: 'POST' }))
      .on('error', error => this.eventBus.emit('error', error))
      .end()
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

  retrievePlaylist() {
    return new Promise<string[]>(resolve => {
      http
        .get(`${this.uri}/playlists`, response => {
          let rawData = ''
          response.setEncoding('utf8')
          response.on('data', data => (rawData += data))
          response.on('end', () => {
            const { playlists } = JSON.parse(rawData)
            const { id, itemCount } = playlists.find(
              (playlist: { isCurrent: boolean }) => playlist.isCurrent
            )

            http
              .get(
                `${
                  this.uri
                }/playlists/${id}/items/0:${itemCount}?columns=%25artist%25%20-%20%25title%25`,
                response => {
                  let rawData = ''
                  response.setEncoding('utf8')
                  response.on('data', data => (rawData += data))
                  response.on('end', () => {
                    const {
                      playlistItems: { items }
                    } = JSON.parse(rawData)
                    resolve(
                      items.map(
                        (item: { columns: string[] }) => item.columns[0]
                      )
                    )
                  })
                }
              )
              .on('error', error => this.eventBus.emit('error', error))
          })
        })
        .on('error', error => this.eventBus.emit('error', error))
    })
  }

  switchTrack(index: number) {
    this.sendPOST(`/player/play/p1/${index}`)
  }

  dispose() {
    this.eventBus.removeAllListeners()
  }
}
