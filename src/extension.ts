import * as vscode from 'vscode'
import { PlayerController } from './PlayerController'

export function activate(context: vscode.ExtensionContext) {
  const status = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  )
  initStatusBarAction(status)
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
    vscode.commands.registerCommand('beefweb.switchSong', async () => {
      const items = await controller.retrievePlaylist()
      const item = await vscode.window.showQuickPick(items)
      if (item) {
        controller.switchSong(items.indexOf(item))
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

function initStatusBarAction(status: vscode.StatusBarItem) {
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
