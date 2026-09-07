import type { FloorDefinition, FloorId } from '../../shared/types.ts';
export const TARGET_FLOORS: readonly FloorId[] = Object.freeze([1, 2, 3, 4, 21, 22, 23, 24, 25]);
export const FLOORS: readonly FloorDefinition[] = Object.freeze(TARGET_FLOORS.map(id => Object.freeze({
  id, name: `${id} 层`,
  description: id === 21 ? '首个正式样板楼层' : '未来的生活空间',
  status: 'planned' as const,
  reason: id === 21 ? '等待参考图片后制作样板。' : '参考资料与空间布局待确认。',
})));
export function getFloor(id: number): FloorDefinition | undefined { return FLOORS.find(floor => floor.id === id); }
export function canEnterFloor(id: number): boolean { return getFloor(id)?.status === 'open'; }
