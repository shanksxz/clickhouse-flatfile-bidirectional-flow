import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, FileText, ArrowLeftRight } from "lucide-react"

type SourceSelectorProps = {
  sourceType: string
  onSourceTypeChange: (type: string) => void
}

export default function SourceSelector({ sourceType, onSourceTypeChange }: SourceSelectorProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            Data Flow Direction
          </h2>
          
          <div className="flex gap-2">
            <Button
              variant={sourceType === "clickhouse" ? "default" : "outline"}
              size="lg"
              onClick={() => onSourceTypeChange("clickhouse")}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              ClickHouse to CSV
            </Button>
            
            <Button
              variant={sourceType === "flatfile" ? "default" : "outline"}
              size="lg"
              onClick={() => onSourceTypeChange("flatfile")}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              CSV to ClickHouse
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}