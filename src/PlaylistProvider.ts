import * as vscode from 'vscode'
import { PlayerController } from './PlayerController'

type Playlist = { id: string; title: string }
type Song = { playlist: string; name: string }
export type TreeItemData = Playlist | Song

export class PlaylistProvider implements vscode.TreeDataProvider<TreeItemData> {
  private playlists!: { [key: string]: { title: string; items: string[] } }

  constructor(
    private controller: PlayerController,
    private context: vscode.ExtensionContext
  ) {
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
      item.iconPath = vscode.Uri.joinPath(
        this.context.extensionUri,
        'media',
        'play_song.svg'
      )
      item.command = {
        command: 'beefweb.switchSong',
        title: 'Switch',
        arguments: [element.name, element.playlist],
      }
    }

    return item
  }

  async getChildren(element?: Playlist) {
    if (!this.playlists) {
      this.playlists = await this.controller.allPlaylists()
    }

    return element?.id
      ? this.playlists[element.id]?.items.map((item) => ({
          playlist: element.id,
          name: item,
        }))
      : Object.entries(this.playlists).map(([id, { title }]) => ({
          id,
          title,
        }))
  }
}
