import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Position {
    x: number;
    y: number;
}
export interface PersistentEventView {
    id: string;
    startTime: bigint;
    endTime: bigint;
    name: string;
    community: string;
    committee: Array<Principal>;
    isActive: boolean;
}
export interface UserProfile {
    bio: string;
    displayName: string;
    links: Array<string>;
}
export interface CommunityScopedUserProfile {
    name: string;
    activities: Array<string>;
    socialNetworkLinks: Array<string>;
    services: Array<string>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    contributeToConstruction(eventId: string, part: Position): Promise<void>;
    createCommunity(name: string, description: string | null): Promise<string>;
    createEvent(id: string, name: string, committee: Array<Principal>, startTime: bigint, endTime: bigint, isActive: boolean, community: string): Promise<void>;
    createOrUpdateProfile(displayName: string, bio: string, links: Array<string>): Promise<void>;
    getActiveConstruction(communityName: string): Promise<Array<Position> | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommunityMap(communityName: string): Promise<Array<[Principal, Position]>>;
    getCommunityScopedUserProfile(communityName: string, user: Principal): Promise<CommunityScopedUserProfile | null>;
    getCompletedConstructions(communityName: string): Promise<Array<Position>>;
    getPersistentActiveEvent(communityName: string): Promise<PersistentEventView | null>;
    getProfile(user: Principal): Promise<UserProfile>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isUserEligibleForEvent(eventId: string, user: Principal): Promise<boolean>;
    joinCommunity(communityName: string): Promise<void>;
    listCommunities(): Promise<Array<[string, string | null]>>;
    listCommunityMembers(communityName: string): Promise<Array<Principal>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveCommunityScopedUserProfile(communityName: string, profile: CommunityScopedUserProfile): Promise<void>;
    setBuildEligibility(eventId: string, user: Principal, wantsToBuild: boolean): Promise<void>;
    updateEventStatus(eventId: string, isActive: boolean): Promise<void>;
}
