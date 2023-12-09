import { RPC, RPCUser } from "./rpc";
import { MyEmitter } from "./emitter";

export interface ChannelData {
  id: string;
  name: string;
  type: number;
  topic: string;
  bitrate: number;
  user_limit: number;
  guild_id: null;
  position: number;
  voice_states: {
    nick: string;
    mute: boolean;
    volume: number;
    user: RPCUser;
  }[];
}

interface DiscordLobbyEvents {
  speak: RPCUser;
  nospeak: RPCUser;
  join: RPCUser;
  leave: RPCUser;
  destroy: undefined;
}

export class DiscordLobby extends MyEmitter<DiscordLobbyEvents> {
  private rpc: RPC;
  channelData: ChannelData;
  me: RPCUser;
  users: Map<string, RPCUser> = new Map();
  private static cache: DiscordLobby;

  constructor(rpc: RPC, channelData: ChannelData) {
    super();
    this.rpc = rpc;
    this.channelData = channelData;
    this.me = rpc.me;

    for (const user of this.channelData.voice_states.map((user) => user.user)) {
      this.users.set(user.id, user);
    }

    this.registerEvents();
  }

  private registerEvents() {
    this.rpc.subscribe(
      "SPEAKING_START",
      { channel_id: this.channelData.id },
      (args) => {
        this.emit("speak", this.users.get(args.user_id) as RPCUser);
      }
    );

    this.rpc.subscribe(
      "SPEAKING_STOP",
      { channel_id: this.channelData.id },
      (args) => {
        this.emit("nospeak", this.users.get(args.user_id) as RPCUser);
      }
    );

    this.rpc.subscribe(
      "VOICE_STATE_CREATE",
      { channel_id: this.channelData.id },
      (args) => {
        this.users.set(args.user.id, args.user);
        this.emit("join", args.user);
      }
    );

    this.rpc.subscribe(
      "VOICE_STATE_DELETE",
      { channel_id: this.channelData.id },
      (args) => {
        if (args.user.id == this.rpc.me.id) {
          this.destroy();
          return;
        }
        this.users.delete(args.user.id);
        this.emit("leave", args.user);
      }
    );
  }

  private async destroy() {
    this.emit("destroy", undefined);
    this.rpc.unsubscribeAll();
  }

  static async get() {
    if (this.cache) return this.cache;

    const rpc = await RPC.get();
    const data = await rpc.getSelectedVoiceChannel();

    if (!data) {
      throw new Error("Not in a voice channel");
    }
    this.cache = new DiscordLobby(rpc, data);

    return this.cache;
  }
}
