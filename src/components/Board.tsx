import React, { useRef, useEffect } from 'react'

import { Toolbar } from '../components/Toolbar'
import {
  GATE_HEIGHT,
  GATE_WIDTH,
  INPUT_SOURCE_SIZE,
  SNAP_RADIUS,
} from '../constants'
import {
  renderScene,
  getGateTerminalPos,
  getSourceTerminalPos,
} from '../engine/renderer'
import type { Point } from '../engine/types'
import { useCircuitEngine } from '../hooks/useCircuitEngine'

function Board() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engine = useCircuitEngine()
  const { circuit, wireInProgress, actions } = engine

  const [draggingId, setDraggingId] = React.useState<string | null>(null)
  const [dragOffset, setDragOffset] = React.useState<Point>({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx) {
      renderScene(ctx, circuit, wireInProgress)
    }
  }, [circuit, wireInProgress])

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const getTerminalAt = React.useCallback(
    (pos: Point) => {
      for (const source of circuit.inputSources) {
        const termPos = getSourceTerminalPos(source)
        const dist = Math.hypot(pos.x - termPos.x, pos.y - termPos.y)
        if (dist < SNAP_RADIUS) {
          return { type: 'source-output', id: source.id, position: termPos }
        }
      }
      for (const gate of circuit.gates) {
        const outPos = getGateTerminalPos(gate, 'output')
        let dist = Math.hypot(pos.x - outPos.x, pos.y - outPos.y)
        if (dist < SNAP_RADIUS) {
          return { type: 'gate-output', id: gate.id, position: outPos }
        }
        for (let i = 0; i < gate.inputsCount; i++) {
          const inPos = getGateTerminalPos(gate, 'input', i)
          dist = Math.hypot(pos.x - inPos.x, pos.y - inPos.y)
          if (dist < SNAP_RADIUS) {
            return {
              type: 'gate-input',
              id: gate.id,
              terminalIndex: i,
              position: inPos,
            }
          }
        }
      }
      return null
    },
    [circuit.gates, circuit.inputSources],
  )

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mousePos = getMousePos(e)
    const terminal = getTerminalAt(mousePos)

    if (terminal) {
      if (terminal.type === 'gate-input') {
        const connectionToEdit = circuit.connections.find(
          (c) =>
            c.toGateId === terminal.id &&
            c.toTerminalIndex === terminal.terminalIndex,
        )
        if (connectionToEdit) {
          actions.deleteConnection(connectionToEdit.id)
          let fromPos: Point | null = null
          const fromSource = circuit.inputSources.find(
            (s) => s.id === connectionToEdit.fromId,
          )
          if (fromSource) fromPos = getSourceTerminalPos(fromSource)
          else {
            const fromGate = circuit.gates.find(
              (g) => g.id === connectionToEdit.fromId,
            )
            if (fromGate) fromPos = getGateTerminalPos(fromGate, 'output')
          }
          if (fromPos) {
            actions.setWireInProgress({
              fromId: connectionToEdit.fromId,
              fromPos: fromPos,
              toPos: mousePos,
            })
          }
          return
        }
      }

      if (
        terminal.type === 'source-output' ||
        terminal.type === 'gate-output'
      ) {
        actions.setWireInProgress({
          fromId: terminal.id,
          fromPos: terminal.position,
          toPos: mousePos,
        })
      }
    } else {
      const source = [...circuit.inputSources]
        .reverse()
        .find(
          (s) =>
            mousePos.x > s.position.x &&
            mousePos.x < s.position.x + INPUT_SOURCE_SIZE &&
            mousePos.y > s.position.y &&
            mousePos.y < s.position.y + INPUT_SOURCE_SIZE,
        )
      if (source) {
        setDraggingId(source.id)
        setDragOffset({
          x: mousePos.x - source.position.x,
          y: mousePos.y - source.position.y,
        })
        return
      }
      const gate = [...circuit.gates]
        .reverse()
        .find(
          (g) =>
            mousePos.x > g.position.x &&
            mousePos.x < g.position.x + GATE_WIDTH &&
            mousePos.y > g.position.y &&
            mousePos.y < g.position.y + GATE_HEIGHT,
        )
      if (gate) {
        setDraggingId(gate.id)
        setDragOffset({
          x: mousePos.x - gate.position.x,
          y: mousePos.y - gate.position.y,
        })
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mousePos = getMousePos(e)
    if (wireInProgress) {
      actions.setWireInProgress((wip) => ({ ...wip!, toPos: mousePos }))
    }
    if (draggingId) {
      actions.updateComponentPosition(draggingId, {
        x: mousePos.x - dragOffset.x,
        y: mousePos.y - dragOffset.y,
      })
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (wireInProgress) {
      const mousePos = getMousePos(e)
      const terminal = getTerminalAt(mousePos)
      if (
        terminal &&
        terminal.type === 'gate-input' &&
        terminal.id !== wireInProgress.fromId
      ) {
        actions.createConnection(
          wireInProgress.fromId,
          terminal.id,
          terminal.terminalIndex!,
        )
      }
      actions.setWireInProgress(null)
    }
    setDraggingId(null)
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingId || wireInProgress) return
    const mousePos = getMousePos(e)
    const source = circuit.inputSources.find(
      (s) =>
        mousePos.x > s.position.x &&
        mousePos.x < s.position.x + INPUT_SOURCE_SIZE &&
        mousePos.y > s.position.y &&
        mousePos.y < s.position.y + INPUT_SOURCE_SIZE,
    )
    if (source) {
      actions.toggleInputSource(source.id)
    }
  }

  return (
    <div className="App">
      <Toolbar
        onAddGate={actions.addGate}
        onAddInputSource={actions.addInputSource}
      />
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight * 0.9}
        style={{ display: 'block' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onMouseLeave={() => {
          setDraggingId(null)
          actions.setWireInProgress(null)
        }}
      />
    </div>
  )
}

export default Board
