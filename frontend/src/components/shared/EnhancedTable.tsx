import React, { useState, useRef, useEffect } from 'react'

// Types for the enhanced table
export interface TableColumn {
  key: string
  label: string
  type: 'text' | 'number' | 'currency' | 'checkbox' | 'scenario' | 'select' | 'icon'
  editable?: boolean
  options?: { value: string; label: string }[]
  width?: string
}

export interface TableRow {
  id: string
  [key: string]: any
}

interface EnhancedTableProps {
  columns: TableColumn[]
  data: TableRow[]
  onRowUpdate: (id: string, field: string, value: any) => Promise<void>
  onRowDelete: (id: string) => Promise<void>
  onRowAdd?: () => void
  addButtonText?: string
  emptyMessage?: string
  summaryData?: { label: string; value: string | number; color?: string }[]
}

export default function EnhancedTable({
  columns,
  data,
  onRowUpdate,
  onRowDelete,
  onRowAdd,
  addButtonText = "Add New",
  emptyMessage = "No items found. Add your first item to get started.",
  summaryData = []
}: EnhancedTableProps) {
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  const handleCellClick = (rowId: string, field: string, value: any) => {
    const column = columns.find(col => col.key === field)
    if (column?.editable && column.type !== 'checkbox' && column.type !== 'scenario') {
      setEditingCell({ rowId, field })
      setEditValue(String(value || ''))
    }
  }

  const handleSave = async () => {
    if (!editingCell) return
    
    setIsUpdating(true)
    try {
      const column = columns.find(col => col.key === editingCell.field)
      let processedValue: any = editValue
      
      if (column?.type === 'number' || column?.type === 'currency') {
        processedValue = parseFloat(editValue) || 0
      }
      
      await onRowUpdate(editingCell.rowId, editingCell.field, processedValue)
      setEditingCell(null)
      setEditValue('')
    } catch (error) {
      console.error('Error updating cell:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = () => {
    setEditingCell(null)
    setEditValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleCheckboxChange = async (rowId: string, field: string, currentValue: string) => {
    const newValue = currentValue === 'on' ? 'off' : 'on'
    await onRowUpdate(rowId, field, newValue)
  }

  const handleScenarioChange = async (rowId: string, field: string, value: string) => {
    await onRowUpdate(rowId, field, value)
  }

  const renderCell = (row: TableRow, column: TableColumn) => {
    const value = row[column.key]
    const isEditing = editingCell?.rowId === row.id && editingCell?.field === column.key

    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type={column.type === 'number' ? 'number' : 'text'}
          step={column.type === 'currency' ? '0.01' : undefined}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isUpdating}
        />
      )
    }

    switch (column.type) {
      case 'icon':
        return (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white text-sm font-bold">{value}</span>
          </div>
        )
      
      case 'checkbox':
        return (
          <button
            onClick={() => handleCheckboxChange(row.id, column.key, value)}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              value === 'on' 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'bg-red-500 border-red-500 text-white'
            }`}
            disabled={isUpdating}
          >
            {value === 'on' ? '✓' : '✗'}
          </button>
        )
      
      case 'scenario':
        return (
          <select
            value={value}
            onChange={(e) => handleScenarioChange(row.id, column.key, e.target.value)}
            className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isUpdating}
          >
            <option value="ALL">All Scenarios</option>
            <option value="A">Scenario A</option>
            <option value="B">Scenario B</option>
            <option value="C">Scenario C</option>
          </select>
        )
      
      case 'currency':
        return (
          <span className="font-semibold text-gray-900 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded">
            €{(typeof value === 'string' ? parseFloat(value) : value || 0).toLocaleString()}
          </span>
        )
      
      case 'number':
        return (
          <span className="font-semibold text-gray-900 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded">
            {(typeof value === 'string' ? parseFloat(value) : value || 0).toLocaleString()}
          </span>
        )
      
      default:
        return (
          <span className="text-gray-900 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded">
            {value || '-'}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      {onRowAdd && (
        <div className="flex justify-end">
          <button
            onClick={onRowAdd}
            className="btn-primary"
          >
            <span className="mr-2">➕</span>
            {addButtonText}
          </button>
        </div>
      )}

      {/* Enhanced Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th 
                    key={column.key} 
                    className="table-header"
                    style={{ width: column.width }}
                  >
                    {column.label}
                  </th>
                ))}
                <th className="table-header w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors duration-200">
                  {columns.map((column) => (
                    <td 
                      key={column.key} 
                      className="table-cell"
                      onClick={() => handleCellClick(row.id, column.key, row[column.key])}
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button 
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        onClick={() => onRowDelete(row.id)}
                        disabled={isUpdating}
                      >
                        <span className="text-lg">🗑️</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="table-cell text-center text-gray-500 py-8">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      {summaryData.length > 0 && (
        <div className="card">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {summaryData.map((item, index) => (
                <div key={index} className="text-center">
                  <p className="text-sm font-medium text-gray-600">{item.label}</p>
                  <p className={`text-2xl font-bold ${item.color || 'text-gray-900'}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
