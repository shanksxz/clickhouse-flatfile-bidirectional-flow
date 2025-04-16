import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye } from "lucide-react"

interface DataPreviewProps {
  previewData: Record<string, any>[]
}

export default function DataPreview({ previewData }: DataPreviewProps) {
  if (!previewData.length) return null

  const columns = Object.keys(previewData[0] || {})

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-green-50 py-4">
        <CardTitle className="text-lg font-semibold text-green-800 flex items-center gap-2">
          <Eye className="h-5 w-5 text-green-600" />
          Data Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {columns.map((column, idx) => (
                  <TableHead key={idx} className="font-semibold text-gray-700">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((row, rowIdx) => (
                <TableRow key={rowIdx} className="hover:bg-gray-50">
                  {columns.map((column, colIdx) => (
                    <TableCell key={`${rowIdx}-${colIdx}`} className="py-2">
                      {typeof row[column] === "object" ? JSON.stringify(row[column]) : String(row[column])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="p-3 text-sm text-gray-500 border-t">Showing {previewData.length} records</div>
      </CardContent>
    </Card>
  )
}
