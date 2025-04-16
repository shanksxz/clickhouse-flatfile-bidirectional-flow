import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface StatusDisplayProps {
  status: string
  progress: number
  recordCount: number | null
  jwtToken: string
  sourceType: string
  getJwtExpiry: (jwt: string) => { expired: boolean; expDate: Date | null }
}

export default function StatusDisplay({
  status,
  progress,
  recordCount,
  jwtToken,
  sourceType,
  getJwtExpiry,
}: StatusDisplayProps) {
  const { expired, expDate } = jwtToken ? getJwtExpiry(jwtToken) : { expired: false, expDate: null }

  const isError = status.startsWith("Error") || status.startsWith("Failed")
  const isSuccess = status.toLowerCase().includes("success") || status.toLowerCase().includes("complete")
  const isLoading = status.startsWith("Fetching") || status.startsWith("Starting") || status.startsWith("Connecting")

  return (
    <Card className="border-gray-200">
      <CardContent className="p-6 flex flex-col items-center">
        <Progress value={progress} className="w-full h-2 mb-4" />

        {status && (
          <div className="flex items-center gap-2 text-lg mb-2">
            {isError ? (
              <AlertCircle className="text-red-500 h-5 w-5" />
            ) : isSuccess ? (
              <CheckCircle className="text-green-500 h-5 w-5" />
            ) : isLoading ? (
              <Loader2 className="text-gray-500 h-5 w-5 animate-spin" />
            ) : null}
            <span
              className={`font-medium ${isError ? "text-red-600" : isSuccess ? "text-green-600" : "text-gray-700"}`}
            >
              {status}
            </span>
          </div>
        )}

        {sourceType === "clickhouse" && expDate && (
          <div className={`text-sm font-medium mt-1 ${expired ? "text-red-600" : "text-green-600"}`}>
            JWT Expiry: {expDate.toLocaleString()} {expired ? " (Expired)" : ""}
          </div>
        )}

        {recordCount !== null && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-3">
              <CheckCircle className="text-green-500 h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Export Complete</h3>
            <p className="text-gray-600 mt-1">CSV file downloaded with {recordCount} records</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
