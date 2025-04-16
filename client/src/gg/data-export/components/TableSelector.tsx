import { Select } from '@/components/ui/select';

type TableSelectorProps = {
  tables: string[];
  selectedTable: string | null;
  onSelectTable: (table: string) => void;
  isLoading: boolean;
};

export const TableSelector = ({ 
  tables, 
  selectedTable, 
  onSelectTable, 
  isLoading 
}: TableSelectorProps) => {
  if (isLoading) {
    return <div>Loading tables...</div>;
  }

  if (tables.length === 0) {
    return <div>No tables found. Please check your connection.</div>;
  }

  return (
    <div className="space-y-2">
      <label htmlFor="table-select">Select a table</label>
      <Select
        value={selectedTable || ''}
        onValueChange={(value) => onSelectTable(value)}
      >
        <option value="">Select a table</option>
        {tables.map((table) => (
          <option key={table} value={table}>
            {table}
          </option>
        ))}
      </Select>
    </div>
  );
}; 