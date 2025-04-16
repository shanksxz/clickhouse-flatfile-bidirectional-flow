import type { Column } from "@/utils/api"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ColumnSelectorProps = {
  columns: Column[]
  selectedColumns: string[]
  onColumnToggle: (columnName: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
}

export default function ColumnSelector({
  columns,
  selectedColumns,
  onColumnToggle,
  onSelectAll,
  onDeselectAll,
}: ColumnSelectorProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Select Columns</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onSelectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={onDeselectAll}>
              Deselect All
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {selectedColumns.length} of {columns.length} columns selected
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {columns.map((column) => {
            const isSelected = selectedColumns.includes(column.name)

            return (
              <div
                key={column.name}
                className={`
                flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
                ${
                  isSelected
                    ? "bg-muted border-input"
                    : "bg-background border-border hover:border-input hover:bg-accent/50"
                }
              `}
                onClick={() => onColumnToggle(column.name)}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onColumnToggle(column.name)}
                />
                <div>
                  <div className="font-medium">{column.name}</div>
                  <Badge variant="secondary" className="mt-1 text-xs font-normal">
                    {column.type}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
