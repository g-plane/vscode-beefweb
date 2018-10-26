import * as vscode from 'vscode'
import { PlayerController } from './PlayerController'
import { PlaylistProvider, TreeItemData } from './PlaylistProvider'

export function activate(context: vscode.ExtensionContext) {
  const status = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  )
  setStatusBarAction(status)
  status.show()
  context.subscriptions.push(status)

  const controller = new PlayerController(
    vscode.workspace.getConfiguration('beefweb').get('server.host'),
    vscode.workspace.getConfiguration('beefweb').get('server.port')
  )
  context.subscriptions.push(controller)
  controller.eventBus.on('statusChanged', playerStatus => {
    if (playerStatus.playbackState === 'stopped') {
      status.text = ''
      return
    }

    status.text = `${playerStatus.playbackState === 'paused' ? '⏸' : '▶️'} ${
      playerStatus.song
    }`
  })

  const provider = new PlaylistProvider(controller)
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider<TreeItemData>(
      'beefwebPlaylist',
      provider
    ),
    vscode.window.createTreeView<TreeItemData>('beefwebPlaylist', {
      treeDataProvider: provider
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('beefweb.playPrev', () => {
      controller.playPrev()
    })
  )
  context.subscriptions.push(
    vscode.commands.registerCommand('beefweb.playNext', () => {
      controller.playNext()
    })
  )
  context.subscriptions.push(
    vscode.commands.registerCommand('beefweb.togglePause', () => {
      controller.togglePause()
    })
  )
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'beefweb.switchSong',
      async (item?: string, playlist?: string) => {
        const items = await controller.retrievePlaylist(playlist)
        item = item || (await vscode.window.showQuickPick(items))
        if (item) {
          controller.switchSong(items.indexOf(item), playlist)
        }
      }
    )
  )
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration('beefweb.statusBarAction')) {
        setStatusBarAction(status)
      }
    })
  )

  controller.eventBus.on('error', (error: Error) => {
    if (!error.message.includes('ECONNREFUSED')) {
      vscode.window.showErrorMessage(`Beefweb: ${error.message}`)
    }
    context.subscriptions.forEach(subscription => subscription.dispose())
  })

  controller.eventBus.on('end', () => {
    context.subscriptions.forEach(subscription => subscription.dispose())
  })
}

export function deactivate() {}

function setStatusBarAction(status: vscode.StatusBarItem) {
  type Action = 'togglePause' | 'playNext' | 'switchSong'

  const action: Action =
    vscode.workspace.getConfiguration('beefweb').get('statusBarAction') ||
    'togglePause'

  switch (action) {
    case 'togglePause':
      status.tooltip = 'Click to toggle pause/play.'
      break
    case 'playNext':
      status.tooltip = 'Click to play next song.'
      break
    case 'switchSong':
      status.tooltip = 'Click to switch to another song.'
      break
  }

  status.command = `beefweb.${action}`

  return status
}
