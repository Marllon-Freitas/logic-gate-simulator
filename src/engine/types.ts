export type GateType = 'AND' | 'NOT' | 'NAND'

export interface Point {
  x: number
  y: number
}

export interface BaseGate {
  id: string
  type: GateType
  position: Point
  inputsCount: number
}

export interface InputSource {
  id: string
  position: Point
  value: boolean
}

export interface Connection {
  id: string
  fromId: string
  toGateId: string
  toTerminalIndex: number
}

export interface WireInProgress {
  fromId: string
  fromPos: Point
  toPos: Point
}

export interface GateLogic {
  inputs: (boolean | null)[]
  output: boolean
}

export type GateLogics = Record<string, GateLogic>

export interface CircuitState {
  inputSources: InputSource[]
  gates: BaseGate[]
  connections: Connection[]
  gateLogics: GateLogics
}
