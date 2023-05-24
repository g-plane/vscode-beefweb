import * as assert from 'assert'
import * as http from 'http'
import * as vscode from 'vscode'

describe('Commands', () => {
  it('play previous song', (done) => {
    const server = http
      .createServer((req, res) => {
        res.end()
        if (req.method === 'POST') {
          assert.strictEqual(req.url, '/api/player/previous')
        }
        server.close()
      })
      .listen(8880)
      .on('close', done)
    vscode.commands.executeCommand('beefweb.playPrev')
  })

  it('play next song', (done) => {
    const server = http
      .createServer((req, res) => {
        res.end()
        if (req.method === 'POST') {
          assert.strictEqual(req.url, '/api/player/next')
        }
        server.close()
      })
      .listen(8880)
      .on('close', done)
    vscode.commands.executeCommand('beefweb.playNext')
  })

  it('toggle pause', (done) => {
    const server = http
      .createServer((req, res) => {
        res.end()
        if (req.method === 'POST') {
          assert.strictEqual(req.url, '/api/player/pause/toggle')
        }
        server.close()
      })
      .listen(8880)
      .on('close', done)
    vscode.commands.executeCommand('beefweb.togglePause')
  })
})
