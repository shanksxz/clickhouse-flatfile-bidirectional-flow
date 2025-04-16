import { Checkbox } from '@/components/ui/checkbox';
import { Column } from '../types';

type ColumnSelectorProps = {
  columns: Column[];
  onToggleColumn: (name: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  isLoading: boolean;
};

export const ColumnSelector = ({
  columns,
  onToggleColumn,
  selectAll,
  deselectAll,
  isLoading,
}: ColumnSelectorProps) => {
  if (isLoading) {
    return <div>Loading columns...</div>;
  }

  if (columns.length === 0) {
    return <div>No columns found. Please select a table.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Select columns to export</h3>
        <div className="space-x-2">
          <button 
            type="button" 
            onClick={selectAll} 
            className="text-blue-500 hover:underline"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={deselectAll}
            className="text-blue-500 hover:underline"
          >
            Deselect All
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {columns.map((column) => (
          <div key={column.name} className="flex items-center space-x-2">
            <Checkbox
              id={`column-${column.name}`}
              checked={column.selected}
              onChange={() => onToggleColumn(column.name)}
            />
            <label htmlFor={`column-${column.name}`} className="flex flex-col">
              <span>{column.name}</span>
              <span className="text-xs text-gray-500">{column.type}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}; 