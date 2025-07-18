import { useState, useCallback, useEffect } from 'react'

import { calculateNextLogicState } from '../engine/simulation'
import type {
  CircuitState,
  GateType,
  Point,
  WireInProgress,
  BaseGate,
  InputSource,
  Connection,
} from '../engine/types'

const initialState: CircuitState = {
  inputSources: [],
  gates: [],
  connections: [],
  gateLogics: {},
}

export function useCircuitEngine() {
  const [circuit, setCircuit] = useState<CircuitState>(initialState)
  const [wireInProgress, setWireInProgress] = useState<WireInProgress | null>(
    null,
  )

  const addGate = useCallback((type: GateType) => {
    setCircuit((prev) => {
      let inputsCount = 2
      if (type === 'NOT') {
        inputsCount = 1
      }

      const newGate: BaseGate = {
        id: `${type}_${Date.now()}`,
        type: type,
        position: { x: 250, y: 50 + prev.gates.length * 80 },
        inputsCount: inputsCount,
      }

      const newLogic = { inputs: Array(inputsCount).fill(null), output: false }

      return {
        ...prev,
        gates: [...prev.gates, newGate],
        gateLogics: { ...prev.gateLogics, [newGate.id]: newLogic },
      }
    })
  }, [])

  const addInputSource = useCallback(() => {
    setCircuit((prev) => {
      const newSource: InputSource = {
        id: `source_${Date.now()}`,
        position: { x: 50, y: 50 + prev.inputSources.length * 70 },
        value: false,
      }
      return { ...prev, inputSources: [...prev.inputSources, newSource] }
    })
  }, [])

  const toggleInputSource = useCallback((sourceId: string) => {
    setCircuit((prev) => ({
      ...prev,
      inputSources: prev.inputSources.map((s) =>
        s.id === sourceId ? { ...s, value: !s.value } : s,
      ),
    }))
  }, [])

  const deleteConnection = useCallback((connId: string) => {
    setCircuit((prev) => ({
      ...prev,
      connections: prev.connections.filter((c) => c.id !== connId),
    }))
  }, [])

  const createConnection = useCallback(
    (fromId: string, toGateId: string, toTerminalIndex: number) => {
      setCircuit((prev) => {
        const alreadyExists = prev.connections.some(
          (c) =>
            c.toGateId === toGateId && c.toTerminalIndex === toTerminalIndex,
        )
        if (alreadyExists) return prev

        const newConnection: Connection = {
          id: `conn_${Date.now()}`,
          fromId,
          toGateId,
          toTerminalIndex,
        }
        return { ...prev, connections: [...prev.connections, newConnection] }
      })
    },
    [],
  )

  const updateComponentPosition = useCallback(
    (id: string, newPosition: Point) => {
      setCircuit((prev) => ({
        ...prev,
        gates: prev.gates.map((g) =>
          g.id === id ? { ...g, position: newPosition } : g,
        ),
        inputSources: prev.inputSources.map((s) =>
          s.id === id ? { ...s, position: newPosition } : s,
        ),
      }))
    },
    [],
  )

  useEffect(() => {
    const newLogics = calculateNextLogicState(circuit)
    if (JSON.stringify(newLogics) !== JSON.stringify(circuit.gateLogics)) {
      setCircuit((prev) => ({ ...prev, gateLogics: newLogics }))
    }
  }, [circuit])

  return {
    circuit,
    wireInProgress,
    actions: {
      addGate,
      addInputSource,
      toggleInputSource,
      deleteConnection,
      createConnection,
      updateComponentPosition,
      setWireInProgress,
    },
  }
}
