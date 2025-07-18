import type { CircuitState, GateLogics } from './types'

export function calculateNextLogicState(state: CircuitState): GateLogics {
  const newGateLogics = JSON.parse(JSON.stringify(state.gateLogics))

  for (let i = 0; i < 5; i++) {
    state.gates.forEach((gate) => {
      const currentLogic = newGateLogics[gate.id]
      if (!currentLogic) return
      const newInputs: (boolean | null)[] = Array(gate.inputsCount).fill(null)

      state.connections.forEach((conn) => {
        if (conn.toGateId === gate.id) {
          const fromSource = state.inputSources.find(
            (s) => s.id === conn.fromId,
          )
          if (fromSource) {
            newInputs[conn.toTerminalIndex] = fromSource.value
          } else {
            const fromGateLogic = newGateLogics[conn.fromId]
            if (fromGateLogic) {
              newInputs[conn.toTerminalIndex] = fromGateLogic.output
            }
          }
        }
      })
      currentLogic.inputs = newInputs

      const allInputsConnected = newInputs.every((inp) => inp !== null)

      let newOutput = false
      switch (gate.type) {
        case 'AND':
          newOutput = newInputs.every((inp) => inp === true)
          break
        case 'NOT':
          newOutput = newInputs[0] === null ? false : !newInputs[0]
          break
        case 'NAND':
          if (!allInputsConnected) return
          newOutput = !newInputs.every((inp) => inp === true)
          break
        case 'OR':
          newOutput = newInputs.some((inp) => inp === true)
          break
        case 'XOR':
          if (!allInputsConnected) return
          newOutput = newInputs.filter((inp) => inp === true).length % 2 === 1
          break
        default:
          break
      }
      currentLogic.output = newOutput
    })
  }
  return newGateLogics
}
