import * as vscode from 'vscode'
import { PlayerController } from './PlayerController'

export function activate(context: vscode.ExtensionContext) {
  const status = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  )
  status.command = 'extension.togglePause'
  status.tooltip = 'Click to play/pause.'
  status.show()

  const controller = new PlayerController(
    vscode.workspace.getConfiguration('beefweb').get('server.host'),
    vscode.workspace.getConfiguration('beefweb').get('server.port')
  )
  controller.eventBus.on('statusChanged', playerStatus => {
    if (playerStatus.playbackState === 'stopped') {
      status.text = ''
      return
    }

    status.text = `${playerStatus.playbackState === 'paused' ? '⏸' : '▶️'} ${
      playerStatus.track
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
    vscode.commands.registerCommand('beefweb.switchTrack', async () => {
      const items = await controller.retrievePlaylist()
      const item = await vscode.window.showQuickPick(items)
      if (item) {
        controller.switchTrack(items.indexOf(item))
      }
    })
  )

  controller.eventBus.on('error', (error: Error) => {
    if (!error.message.includes('ECONNREFUSED')) {
      vscode.window.showErrorMessage(`Beefweb: ${error.message}`)
    }
    status.dispose()
    controller.dispose()
    context.subscriptions.forEach(subscription => subscription.dispose())
  })

  controller.eventBus.on('end', () => {
    status.dispose()
    controller.dispose()
    context.subscriptions.forEach(subscription => subscription.dispose())
  })
}

export function deactivate() {}
