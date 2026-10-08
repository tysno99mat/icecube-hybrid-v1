export type EventType = 'through' | 'starting' | 'cascade';
export type Triple = [number, number, number];
export interface EventInput {seed:number; type:EventType; energy:number; vertex:Triple; direction:Triple}
export interface Controls {type:EventType; energy:number; directionMode:'up'|'down'|'any'; seed:number}
export interface DOMSensor {idx:number; str:number; om:number; x:number; y:number; z:number; depth:number}
export interface Hit {dom:number; n:number; q:number; t:number; tPhys:number|null; noise:boolean; clean:boolean}
export type FitStatus = 'FIT_NOT_COMPUTED'|'FIT_COMPUTED'|'GEOMETRY_NONDEGENERATE'|'FIT_RENDERABLE'|'NOT_APPLICABLE';
