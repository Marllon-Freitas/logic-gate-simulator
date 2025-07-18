import {
  COLOR_AND_GATE_BODY,
  COLOR_NAND_GATE_BODY,
  COLOR_NOT_GATE_BODY,
  COLOR_OFF,
  COLOR_ON,
  COLOR_STROKE,
  COLOR_TERMINAL_BG,
  COLOR_TEXT,
  GATE_HEIGHT,
  GATE_WIDTH,
  INPUT_SOURCE_SIZE,
  TERMINAL_RADIUS,
} from '../constants'
import type {
  CircuitState,
  BaseGate,
  InputSource,
  Connection,
  WireInProgress,
  GateLogic,
  Point,
} from './types'

export function getGateTerminalPos(
  gate: BaseGate,
  type: 'input' | 'output',
  index: number = 0,
): Point {
  const { x, y } = gate.position
  if (type === 'input') {
    const yOffset = (GATE_HEIGHT / (gate.inputsCount + 1)) * (index + 1)
    return { x, y: y + yOffset }
  } else {
    return { x: x + GATE_WIDTH, y: y + GATE_HEIGHT / 2 }
  }
}

export function getSourceTerminalPos(source: InputSource): Point {
  const { x, y } = source.position
  return { x: x + INPUT_SOURCE_SIZE, y: y + INPUT_SOURCE_SIZE / 2 }
}

function drawGate(
  ctx: CanvasRenderingContext2D,
  gate: BaseGate,
  logic: GateLogic,
) {
  switch (gate.type) {
    case 'AND':
      drawAndGate(ctx, gate, logic)
      break
    case 'NOT':
      drawNotGate(ctx, gate, logic)
      break
    case 'NAND':
      drawNandGate(ctx, gate, logic)
      break
    default:
      break
  }
}

function drawNotGate(
  ctx: CanvasRenderingContext2D,
  gate: BaseGate,
  logic: GateLogic,
) {
  const { x, y } = gate.position

  ctx.fillStyle = COLOR_NOT_GATE_BODY
  ctx.strokeStyle = COLOR_STROKE
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.rect(x, y, GATE_WIDTH, GATE_HEIGHT)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = COLOR_TEXT
  ctx.font = 'bold 22px "Silkscreen", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('NOT', x + GATE_WIDTH / 2, y + GATE_HEIGHT / 2)

  const inPos = getGateTerminalPos(gate, 'input', 0)
  const signal = logic.inputs[0]
  ctx.fillStyle =
    signal === null ? COLOR_TERMINAL_BG : signal ? COLOR_ON : COLOR_OFF
  ctx.beginPath()
  ctx.arc(inPos.x, inPos.y, TERMINAL_RADIUS, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()

  const outPos = getGateTerminalPos(gate, 'output')
  ctx.fillStyle = logic.output ? COLOR_ON : COLOR_OFF
  ctx.beginPath()
  ctx.arc(outPos.x, outPos.y, TERMINAL_RADIUS, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
}

function drawAndGate(
  ctx: CanvasRenderingContext2D,
  gate: BaseGate,
  logic: GateLogic,
) {
  const { x, y } = gate.position

  ctx.fillStyle = COLOR_AND_GATE_BODY
  ctx.strokeStyle = COLOR_STROKE
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.rect(x, y, GATE_WIDTH, GATE_HEIGHT)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = COLOR_TEXT
  ctx.font = 'bold 22px "Silkscreen", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(gate.type, x + GATE_WIDTH / 2, y + GATE_HEIGHT / 2)

  for (let i = 0; i < gate.inputsCount; i++) {
    const termPos = getGateTerminalPos(gate, 'input', i)
    const signal = logic.inputs[i]
    ctx.fillStyle =
      signal === null ? COLOR_TERMINAL_BG : signal ? COLOR_ON : COLOR_OFF
    ctx.beginPath()
    ctx.arc(termPos.x, termPos.y, TERMINAL_RADIUS, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
  }

  const termPos = getGateTerminalPos(gate, 'output')
  ctx.fillStyle = logic.output ? COLOR_ON : COLOR_OFF
  ctx.beginPath()
  ctx.arc(termPos.x, termPos.y, TERMINAL_RADIUS, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
}

function drawNandGate(
  ctx: CanvasRenderingContext2D,
  gate: BaseGate,
  logic: GateLogic,
) {
  const { x, y } = gate.position

  // Corpo
  ctx.fillStyle = COLOR_NAND_GATE_BODY
  ctx.strokeStyle = COLOR_STROKE
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.rect(x, y, GATE_WIDTH, GATE_HEIGHT)
  ctx.fill()
  ctx.stroke()

  // Texto
  ctx.fillStyle = COLOR_TEXT
  ctx.font = 'bold 22px "Silkscreen", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('NAND', x + GATE_WIDTH / 2, y + GATE_HEIGHT / 2)

  // Terminais
  for (let i = 0; i < gate.inputsCount; i++) {
    const termPos = getGateTerminalPos(gate, 'input', i)
    const signal = logic.inputs[i]
    ctx.fillStyle =
      signal === null ? COLOR_TERMINAL_BG : signal ? COLOR_ON : COLOR_OFF
    ctx.beginPath()
    ctx.arc(termPos.x, termPos.y, TERMINAL_RADIUS, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
  }
  const termPos = getGateTerminalPos(gate, 'output')
  ctx.fillStyle = logic.output ? COLOR_ON : COLOR_OFF
  ctx.beginPath()
  ctx.arc(termPos.x, termPos.y, TERMINAL_RADIUS, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
}

function drawInputSource(ctx: CanvasRenderingContext2D, source: InputSource) {
  const { x, y } = source.position
  ctx.fillStyle = source.value ? COLOR_ON : COLOR_TERMINAL_BG
  ctx.strokeStyle = COLOR_STROKE
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.rect(x, y, INPUT_SOURCE_SIZE, INPUT_SOURCE_SIZE)
  ctx.fill()
  ctx.stroke()

  const termPos = getSourceTerminalPos(source)
  ctx.fillStyle = source.value ? COLOR_ON : COLOR_OFF
  ctx.beginPath()
  ctx.arc(termPos.x, termPos.y, TERMINAL_RADIUS, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
}

function drawConnection(
  ctx: CanvasRenderingContext2D,
  conn: Connection,
  state: CircuitState,
) {
  const toGate = state.gates.find((g) => g.id === conn.toGateId)
  if (!toGate) return
  const toPos = getGateTerminalPos(toGate, 'input', conn.toTerminalIndex)

  let fromPos: Point | null = null
  let signalOn = false

  const fromSource = state.inputSources.find((s) => s.id === conn.fromId)
  if (fromSource) {
    fromPos = getSourceTerminalPos(fromSource)
    signalOn = fromSource.value
  } else {
    const fromGate = state.gates.find((g) => g.id === conn.fromId)
    if (fromGate) {
      fromPos = getGateTerminalPos(fromGate, 'output')
      signalOn = state.gateLogics[fromGate.id]?.output ?? false
    }
  }

  if (!fromPos) return

  ctx.beginPath()
  ctx.moveTo(fromPos.x, fromPos.y)
  ctx.lineTo(toPos.x, toPos.y)
  ctx.strokeStyle = signalOn ? COLOR_ON : COLOR_OFF
  ctx.lineWidth = 3
  ctx.stroke()
}

function drawWireInProgress(
  ctx: CanvasRenderingContext2D,
  wire: WireInProgress,
) {
  ctx.beginPath()
  ctx.moveTo(wire.fromPos.x, wire.fromPos.y)
  ctx.lineTo(wire.toPos.x, wire.toPos.y)
  ctx.strokeStyle = COLOR_STROKE
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])
  ctx.stroke()
  ctx.setLineDash([])
}

export function renderScene(
  ctx: CanvasRenderingContext2D,
  state: CircuitState,
  wireInProgress: WireInProgress | null,
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  state.connections.forEach((conn) => drawConnection(ctx, conn, state))
  state.inputSources.forEach((source) => drawInputSource(ctx, source))
  state.gates.forEach((gate) => {
    const logic = state.gateLogics[gate.id]
    if (logic) {
      drawGate(ctx, gate, logic)
    }
  })

  if (wireInProgress) {
    drawWireInProgress(ctx, wireInProgress)
  }
}
