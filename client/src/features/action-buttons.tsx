import { Button } from "@/components/ui/button"
import { Columns, Eye, Play, Loader2, Upload } from "lucide-react"

type ActionButtonsProps = {
  loadColumns: () => Promise<void>
  previewData: () => Promise<void>
  startExport: () => Promise<void>
  columnsLength: number
  selectedColumnsLength: number
  status: string
  progress: number
  sourceType: string
}

export default function ActionButtons({
  loadColumns,
  previewData,
  startExport,
  columnsLength,
  selectedColumnsLength,
  status,
  progress,
  sourceType,
}: ActionButtonsProps) {
  const isLoadingColumns = status.startsWith("Fetching columns")
  const isPreviewingData = status.startsWith("Fetching preview")
  const isExporting = status.startsWith("Starting") || (progress > 0 && progress < 100)

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <Button
        onClick={loadColumns}
        disabled={isLoadingColumns}
      >
        {isLoadingColumns ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Columns className="mr-2 h-4 w-4" />}
        Load Columns
      </Button>

      {columnsLength > 0 && (
        <>
          <Button
            onClick={previewData}
            disabled={isPreviewingData || selectedColumnsLength === 0}
            variant="secondary"
          >
            {isPreviewingData ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
            Preview Data
          </Button>

          <Button
            onClick={startExport}
            disabled={isExporting || selectedColumnsLength === 0}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : sourceType === "clickhouse" ? (
              <Play className="mr-2 h-4 w-4" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {sourceType === "clickhouse" ? "Export to CSV" : "Import to ClickHouse"}
          </Button>
        </>
      )}
    </div>
  )
}
