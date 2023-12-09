import WebSocket from "ws";
import { RPCCommand } from "./RPCCommands";
import { RPCEvents } from "./RPCEvents";
export let connected = false;

async function connectSpoofed() {
  const uuid4122 = () => {
    let uuid = "";
    for (let i = 0; i < 32; i += 1) {
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        uuid += "-";
      }
      let n;
      if (i === 12) {
        n = 4;
      } else {
        const random = (Math.random() * 16) | 0;
        if (i === 16) {
          n = (random & 3) | 0;
        } else {
          n = random;
        }
      }
      uuid += n.toString(16);
    }
    return uuid;
  };

  return new Promise<{
    data: RPCData;
    socket: WebSocket;
    access_token: string;
    clientId: string;
    nonce: string;
  }>((res, rej) => {
    const nonce = uuid4122();
    const ws = new WebSocket(
      "ws://127.0.0.1:6463/?v=1&client_id=207646673902501888",
      {
        headers: {
          Origin: "https://streamkit.discord.com",
        },
      }
    );

    ws.on("error", console.error);

    ws.on("open", function open() {});

    ws.on("message", function message(data) {
      parseMessage(data.toString());
    });

    ws.on("close", () => {
      console.log("closed");
    });
    let token = "";

    async function parseMessage(data: string) {
      const parsedData = JSON.parse(data);
      if (parsedData.cmd == "DISPATCH") {
        sendData({
          cmd: "AUTHORIZE",
          args: {
            client_id: "207646673902501888",
            scopes: ["rpc", "messages.read"],
            prompt: "none",
          },
          nonce,
        });
      }
      if (parsedData.cmd === "AUTHORIZE") {
        const tokenReq = await fetchToken(parsedData.data.code);
        const tokenData = await tokenReq.json();
        token = tokenData.access_token;
        sendData({
          cmd: "AUTHENTICATE",
          args: { access_token: tokenData.access_token },
          nonce,
        });
      }

      if (parsedData.cmd === "AUTHENTICATE") {
        res({
          data: parsedData.data,
          socket: ws,
          nonce,
          access_token: token,
          clientId: "207646673902501888",
        });
      }
    }

    function fetchToken(code: string) {
      return fetch("https://streamkit.discord.com/overlay/token", {
        body: `{\"code\":"${code}"}`,
        method: "POST",
      });
    }

    function sendData(json: any) {
      ws.send(JSON.stringify(json));
    }
  });
}

interface RPCApp {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: null;
  summary: string;
  verify_key: string;
  flags: number;
  hook: boolean;
  is_monetized: false;
}
export interface RPCUser {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  public_flags: number;
  premium_type: number;
  flags: number;
  banner: null;
  accent_color: null;
  global_name: string;
  avatar_decoration_data: {
    asset: string;
    sku_id: string;
  };
  banner_color: null;
}

interface RPCData {
  application: RPCApp;
  user: RPCUser;
}

export class RPC {
  data: RPCData;
  socket: WebSocket;
  nonce: string;
  me: RPCUser;
  constructor(data: RPCData, socket: WebSocket, nonce: string) {
    this.data = data;
    this.socket = socket;
    this.nonce = nonce;
    this.me = data.user;
  }

  static async get() {
    const { data, socket, nonce } = await connectSpoofed();
    return new RPC(data, socket, nonce);
  }

  async sendPacket(packetName: RPCCommand, payload?: Record<string, any>) {
    return new Promise((res, rej) => {
      const listener = (data) => {
        const packet = JSON.parse(data.toString());
        if (packet.cmd == packetName) {
          this.socket.removeListener("message", listener);
          res(JSON.parse(data).data);
        }
      };
      this.socket.on("message", listener);

      this.socket.send(
        JSON.stringify({ cmd: packetName, args: payload, nonce: this.nonce })
      );
    });
  }

  async getSelectedVoiceChannel(): Promise<any> {
    return this.sendPacket("GET_SELECTED_VOICE_CHANNEL");
  }

  async subscribe(
    event: RPCEvents,
    args: Record<string, any>,
    callback: (...data) => void
  ) {
    const listener = (data) => {
      const packet = JSON.parse(data.toString());
      if (packet.cmd == "DISPATCH" && packet.evt == event) {
        callback(packet.data);
      }
    };
    this.socket.on("message", listener);

    this.socket.send(
      JSON.stringify({ cmd: "SUBSCRIBE", args, evt: event, nonce: this.nonce })
    );
  }

  async unsubscribeAll() {
    this.socket.removeAllListeners();
  }

  getAvatarLink(user: RPCUser) {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp`;
  }
}
