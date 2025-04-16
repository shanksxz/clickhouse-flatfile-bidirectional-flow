import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight } from "lucide-react"
import type { Column } from "@/utils/api"

type ColumnMappingProps = {
  csvColumns: string[]
  targetColumns: Column[]
  columnMapping: Record<string, string>
  onMappingChange: (csvColumn: string, targetColumn: string) => void
}

export default function ColumnMapping({
  csvColumns,
  targetColumns,
  columnMapping,
  onMappingChange
}: ColumnMappingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Map CSV Columns to ClickHouse Table</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-4 font-medium text-sm mb-2">
            <div className="col-span-2">CSV Column</div>
            <div className="col-span-1 text-center"></div>
            <div className="col-span-2">ClickHouse Column</div>
          </div>
          
          {csvColumns.map(csvColumn => (
            <div key={csvColumn} className="grid grid-cols-5 gap-4 items-center">
              <div className="col-span-2 px-3 py-2 bg-muted/50 rounded-md">
                {csvColumn}
              </div>
              
              <div className="col-span-1 flex justify-center">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="col-span-2">
                <Select
                  value={columnMapping[csvColumn] || ""}
                  onValueChange={(value) => onMappingChange(csvColumn, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-- Skip this column --</SelectItem>
                    {targetColumns.map(col => (
                      <SelectItem key={col.name} value={col.name}>
                        {col.name} ({col.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
          
          <p className="text-sm text-muted-foreground mt-4">
            Map each CSV column to the corresponding column in the ClickHouse table, 
            or select "Skip this column" to exclude it from the import.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}