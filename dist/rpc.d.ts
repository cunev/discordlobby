import WebSocket from "ws";
import { RPCCommand } from "./RPCCommands";
import { RPCEvents } from "./RPCEvents";
export declare let connected: boolean;
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
export declare class RPC {
    data: RPCData;
    socket: WebSocket;
    nonce: string;
    me: RPCUser;
    constructor(data: RPCData, socket: WebSocket, nonce: string);
    static get(): Promise<RPC>;
    sendPacket(packetName: RPCCommand, payload?: Record<string, any>): Promise<unknown>;
    getSelectedVoiceChannel(): Promise<any>;
    subscribe(event: RPCEvents, args: Record<string, any>, callback: (...data: any[]) => void): Promise<void>;
    unsubscribeAll(): Promise<void>;
    getAvatarLink(user: RPCUser): string;
}
export {};
