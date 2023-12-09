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
export declare class DiscordLobby extends MyEmitter<DiscordLobbyEvents> {
    private rpc;
    channelData: ChannelData;
    me: RPCUser;
    users: Map<string, RPCUser>;
    private static cache;
    constructor(rpc: RPC, channelData: ChannelData);
    private registerEvents;
    private destroy;
    static get(): Promise<DiscordLobby>;
}
export {};
