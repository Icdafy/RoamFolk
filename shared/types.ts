/** Coordinates: meters, Y up. Floor navigation uses X/Z. */
export type Vec3 = Readonly<{ x: number; y: number; z: number }>;
export type FloorId = 1 | 2 | 3 | 4 | 21 | 22 | 23 | 24 | 25;
export type Activity = 'work' | 'idle' | 'eat' | 'play' | 'browse' | 'rest';
export type Quality = 'low' | 'medium' | 'high';
export interface CameraDefinition { position: Vec3; target: Vec3; viewHeight: number }
export interface NavigationDefinition {
  origin: Vec3; cellSize: number; width: number; height: number;
  blockedCells: readonly number[];
}
interface FloorMetadata { id: FloorId; name: string; description: string }
export type FloorDefinition = FloorMetadata & (
  | { status: 'planned'; reason: string }
  | { status: 'open'; modelUrl: string; previewUrl: string; camera: CameraDefinition; spawn: Vec3; navigation: NavigationDefinition; interactables: readonly InteractableDefinition[] }
);
export interface AvatarDefinition {
  id: string; name: string; category: 'human' | 'object'; modelUrl: string;
  appearance: { colors: readonly string[]; accessories: readonly string[] };
  animations: Record<'idle' | 'walk' | 'run' | 'work' | 'rest' | 'eat' | 'emote', string>;
  anchors: Readonly<Record<string, Vec3>>;
}
export interface InteractableDefinition {
  id: string; type: 'desk' | 'seat' | 'food' | 'toy' | 'display' | 'elevator';
  position: Vec3; approach: Vec3; activities: readonly Activity[];
}
export interface SaveGame {
  version: 1; updatedAt: string;
  avatar: { id: string; color: string; accessories: string[] };
  location: { floorId: FloorId; position: Vec3 } | null;
  desk: { floorId: FloorId; interactableId: string } | null;
  activitySeconds: Record<Activity, number>;
  settings: { quality: Quality; reducedMotion: boolean; volume: number };
}
export type SessionResult = { ok: true } | { ok: false; reason: string };
/** Contract only in v0.1.1; implementation belongs to the system prototype. */
export interface WorldSession {
  moveTo(target: Vec3): Promise<SessionResult>;
  setMovement(direction: { x: number; z: number }): void;
  startActivity(interactableId: string, activity: Activity): Promise<SessionResult>;
  stopActivity(): void;
  changeFloor(floorId: FloorId): Promise<SessionResult>;
  claimDesk(interactableId: string): Promise<SessionResult>;
  getSnapshot(): Readonly<SaveGame>;
  dispose(): void;
}
