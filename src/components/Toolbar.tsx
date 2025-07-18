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
    </div>
  )
}
