import React from 'react'

import type { GateType } from '../engine/types'

interface ToolbarProps {
  onAddGate: (type: GateType) => void
  onAddInputSource: () => void
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddGate,
  onAddInputSource,
}) => {
  return (
    <div style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
      <button onClick={onAddInputSource}>Add Input Source</button>

      <button onClick={() => onAddGate('AND')} style={{ marginLeft: '10px' }}>
        Add AND Gate
      </button>

      <button onClick={() => onAddGate('NOT')} style={{ marginLeft: '10px' }}>
        Add NOT Gate
      </button>

      <button onClick={() => onAddGate('NAND')} style={{ marginLeft: '10px' }}>
        Add NAND Gate
      </button>

      <button onClick={() => onAddGate('OR')} style={{ marginLeft: '10px' }}>
        Add OR Gate
      </button>

      <button onClick={() => onAddGate('XOR')} style={{ marginLeft: '10px' }}>
        Add XOR Gate
      </button>
    </div>
  )
}
