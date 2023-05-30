# vscode-beefweb

This Visual Studio Code extension can let you control your Beefweb server in VS Code.

Beefweb supports foobar2000 player and deadbeef player,
so you can use this extension to control your foobar2000 player or deadbeef player.

## Installation

Before using this extension, you must install the [Beefweb](https://github.com/hyperblast/beefweb) component to foobar2000 player or deadbeef player.

Then you just need to install this extension in VS Code extension marketplace.

## Features

- Display the playback status in status bar.
- Display the current song in status bar.
- Toggle play/pause by clicking the status bar.
- Play next or previous song by using command.
- Toggle play/pause by using command.
- Switch to another song by using command with a list.

## Screenshots

Playing:

![](https://media.githubusercontent.com/media/g-plane/vscode-beefweb/master/media/playing.png)

Paused:

![](https://media.githubusercontent.com/media/g-plane/vscode-beefweb/master/media/paused.png)

Commands:

![](https://media.githubusercontent.com/media/g-plane/vscode-beefweb/master/media/commands.png)

Select a song from playlist:

![](https://media.githubusercontent.com/media/g-plane/vscode-beefweb/master/media/list.png)

## Customize Server URL

Your Beefweb server may not run on `127.0.0.1` via port `8880`,
then you can configure the server URL in settings.

Open VS Code settings, then go to "Beefweb › Server: Url" and edit the value like this: `http://example.com:1234`.
Please don't put the trailing `/` or `/api` to the URL.

## Running on Web

This extension is supported on VS Code for Web like [github.dev](https://github.dev) or [vscode.dev](https://vscode.dev).
However, due to CORS in browsers, you must configure CORS headers on Beefweb.

You can configure Beefweb in `beefweb.config.json` like this:

```json
{
  "responseHeaders": {
    "Access-Control-Allow-Origin": "*"
  }
}
```

For more detail, please refer to [Configuring Beefweb Web Server](https://github.com/hyperblast/beefweb/blob/master/docs/advanced-config.md#web-server-settings).

## License

MIT License (c) 2018-present Pig Fang
