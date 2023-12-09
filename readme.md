# DiscordLobby

DiscordLobby is a Node.Js package designed to interface with Discord voice channels. It provides a simple and efficient way to interact with voice channel data and events in Discord. This package is particularly useful for creating games or applications.

## Use-case

You can use this to create lobbies in games based on user's voice channel.

## Features

- Retrieve and manage voice channel data.
- Listen to various voice channel events like speaking start/stop, user join/leave.
- Easy to use with modern JavaScript async/await patterns.

## Installation

Before you begin, ensure you have Node.js installed on your system. Then, you can install the package using npm:

```
npm install @dimulcu/discordlobby
```

Or using yarn:

```
yarn add @dimulcu/discordlobby
```

## Usage

Here's a basic example to get you started:

```javascript
import { DiscordLobby } from "discordlobby";

async function main() {
  try {
    const lobby = await DiscordLobby.get();
    console.log("Connected to voice channel:", lobby.channelData.name);

    lobby.on("speak", (userId) => {
      console.log(`User ${userId} started speaking.`);
    });

    lobby.on("nospeak", (userId) => {
      console.log(`User ${userId} stopped speaking.`);
    });

    lobby.on("join", (user) => {
      console.log(`User ${user.id} joined the channel.`);
    });

    lobby.on("leave", (user) => {
      console.log(`User ${user.id} left the channel.`);
    });

    lobby.on("destroy", () => {
      console.log("Lobby destroyed, you left.");
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
```

## API Reference

### `DiscordLobby`

- `constructor(rpc: RPC, channelData: ChannelData)`
  - Initializes a new instance of DiscordLobby.
- `static async get()`
  - Static method to create a new instance of DiscordLobby.
- `channelData: ChannelData`
  - Contains data about the current voice channel.
- `me: RPCUser`
  - Information about the current user.
- `users: Map<string, RPCUser>`
  - A map of users in the voice channel, it auto-updates when someone joins or leaves.

### Events

- `speak`
  - Emitted when a user starts speaking.
- `nospeak`
  - Emitted when a user stops speaking.
- `join`
  - Emitted when a new user joins the voice channel.
- `leave`
  - Emitted when a user leaves the voice channel.
- `destroy`
  - Emitted when the lobby is destroyed.

## Contributing

Contributions to the DiscordLobby package are welcome.

## License

This project is licensed under the MIT License.
