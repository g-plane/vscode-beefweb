import * as path from 'path'
import * as vscode from 'vscode'
import { PlayerController } from './PlayerController'

type Playlist = { id: string; title: string }
type Song = { playlist: string; name: string }
export type TreeItemData = Playlist | Song

export class PlaylistProvider implements vscode.TreeDataProvider<TreeItemData> {
  private playlists!: { [key: string]: { title: string; items: string[] } }

  constructor(private controller: PlayerController) {
    //
  }

  private isPlaylistName(element: TreeItemData): element is Playlist {
    return !!(element as Playlist).id
  }

  getTreeItem(element: TreeItemData) {
    const item = new vscode.TreeItem(
      this.isPlaylistName(element) ? element.title : element.name
    )

    if (this.isPlaylistName(element)) {
      item.collapsibleState = vscode.TreeItemCollapsibleState.Expanded
    } else {
      item.iconPath = path.join(__dirname, '..', 'media', 'play.svg')
      item.command = {
        command: 'beefweb.switchSong',
        title: 'Switch',
        arguments: [element.name, element.playlist]
      }
    }

    return item
  }

  async getChildren(element?: Playlist) {
    if (!this.playlists) {
      this.playlists = await this.controller.allPlaylists()
    }

    if (!element) {
      return Object.keys(this.playlists).map(item => ({
        id: item,
        title: this.playlists[item].title
      }))
    }
    return this.playlists[element.id].items.map(item => ({
      playlist: element.id,
      name: item
    }))
  }
}
