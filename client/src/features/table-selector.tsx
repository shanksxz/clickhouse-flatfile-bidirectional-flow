import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database } from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type TableSelectorProps = {
  tables: Array<string | { name: string }>
  selectedTables: string[]
  setSelectedTables: (tables: string[]) => void
  getTableName: (table: string | { name: string }) => string
}

export default function TableSelector({
  tables,
  selectedTables,
  setSelectedTables,
  getTableName
}: TableSelectorProps) {
  const handleTableSelection = (tableName: string) => {
    if (selectedTables.includes(tableName)) {
      setSelectedTables([])
    } else {
      setSelectedTables([tableName])
    }
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Select Table
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedTables[0] || ""}
          onValueChange={handleTableSelection}
          className="flex flex-wrap gap-2"
        >
          {tables.map((table, idx) => {
            const tableName = getTableName(table)
            return (
              <div
                key={`table-${idx}`}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md border cursor-pointer transition-colors ${
                  selectedTables.includes(tableName)
                    ? "bg-primary/10 border-primary/30"
                    : "bg-card hover:bg-muted/50 border-input"
                }`}
              >
                <RadioGroupItem value={tableName} id={`table-${idx}`} />
                <Label htmlFor={`table-${idx}`} className="cursor-pointer">
                  {tableName}
                </Label>
              </div>
            )
          })}
        </RadioGroup>
        
        {tables.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            {selectedTables.length === 0 
              ? "Select a table to continue"
              : `Selected table: ${selectedTables[0]}`}
          </p>
        )}
      </CardContent>
    </Card>
  )
}