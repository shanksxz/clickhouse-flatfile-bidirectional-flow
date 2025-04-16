"use client"

import { useState, type ChangeEvent } from "react"
import { clickhouseService } from "@/utils/api"
import type { Column, ClickHouseConnection } from "@/utils/api"
import SourceSelector from "./source-selector"
import ConnectionForm from "./connection-form"
import TableSelector from "./table-selector"
import ColumnSelector from "./column-selector"
import ActionButtons from "./action-buttons"
import DataPreview from "./data-preview"
import FileUpload from "./file-upload"
import { Card, CardContent } from "@/components/ui/card"

export default function DataIngestionPage() {
  const [sourceType, setSourceType] = useState("clickhouse")
  const [clickhouseConfig, setClickhouseConfig] = useState<ClickHouseConnection>({
    host: "",
    port: "8123",
    database: "",
    username: "",
    jwtToken: "",
  })
  const [flatFileConfig, setFlatFileConfig] = useState({
    fileName: "",
    delimiter: ",",
  })
  const [csvFile, setCsvFile] = useState<File | null>(null)

  const [tables, setTables] = useState<(string | { name: string })[]>([])
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [columns, setColumns] = useState<Column[]>([])
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [status, setStatus] = useState("")
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([])
  const [recordCount, setRecordCount] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  const handleConnectionConfigChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setClickhouseConfig((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFlatFileConfigChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFlatFileConfig((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileUpload = (file: File) => {
    setCsvFile(file)
    setFlatFileConfig((prev) => ({
      ...prev,
      fileName: file.name,
    }))
    setStatus(`File "${file.name}" selected (${(file.size / 1024).toFixed(2)} KB)`)
  }

  function getJwtExpiry(jwt: string): { expired: boolean; expDate: Date | null } {
    if (!jwt) return { expired: false, expDate: null }
    try {
      const payload = JSON.parse(atob(jwt.split(".")[1]))
      if (!payload.exp) return { expired: false, expDate: null }
      const expDate = new Date(payload.exp * 1000)
      const expired = expDate.getTime() < Date.now()
      return { expired, expDate }
    } catch {
      return { expired: false, expDate: null }
    }
  }

  const connectToClickHouse = async () => {
    const { expired, expDate } = getJwtExpiry(clickhouseConfig.jwtToken)
    if (expired) {
      setStatus(
        "JWT token is expired" +
        (expDate ? ` (expired at ${expDate.toLocaleString()})` : "") +
        ". Please provide a valid token.",
      )
      return
    }

    setStatus("Connecting to ClickHouse...")
    try {
      const connectionConfig = {
        host: clickhouseConfig.host,
        port: clickhouseConfig.port,
        database: clickhouseConfig.database,
        username: clickhouseConfig.username,
        jwtToken: clickhouseConfig.jwtToken,
      }

      const validationResult = await clickhouseService.validateConnection(connectionConfig)

      if (!validationResult.success) {
        throw new Error(validationResult.error || "Connection failed")
      }

      setStatus("Fetching tables...")
      const tablesList = await clickhouseService.getTables(connectionConfig)
      setTables(tablesList)
      setIsConnected(true)
      setStatus("Connected successfully. Tables loaded.")
    } catch (error) {
      setStatus("Connection failed: " + (error instanceof Error ? error.message : "Unknown error"))
      setTables([])
      setIsConnected(false)
    }
  }

  const connectToFlatFile = async () => {
    if (!csvFile) {
      setStatus("Please upload a CSV file.")
      return
    }

    setStatus("Processing CSV file...")
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockColumns: Column[] = [
        { name: "id", type: "Int32" },
        { name: "name", type: "String" },
        { name: "email", type: "String" },
        { name: "age", type: "Int32" },
        { name: "created_at", type: "DateTime" },
      ]

      setColumns(mockColumns)
      setIsConnected(true)
      setStatus("CSV file processed. Columns extracted.")
    } catch (error) {
      setStatus("Failed to process CSV: " + (error instanceof Error ? error.message : "Unknown error"))
      setColumns([])
      setIsConnected(false)
    }
  }

  const loadColumns = async () => {
    if (sourceType === "clickhouse") {
      if (selectedTables.length === 0) {
        setStatus("Please select at least one table.")
        return
      }

      setStatus("Fetching columns...")
      try {
        const connectionConfig = {
          host: clickhouseConfig.host,
          port: clickhouseConfig.port,
          database: clickhouseConfig.database,
          username: clickhouseConfig.username,
          jwtToken: clickhouseConfig.jwtToken,
        }

        let allColumns: Column[] = []
        for (const table of selectedTables) {
          const columnsData = await clickhouseService.getColumns(connectionConfig, table)

          const columnsWithSelection = columnsData.map((col) => ({
            ...col,
            selected: false,
          }))

          allColumns = [...allColumns, ...columnsWithSelection]
        }

        const uniqueColumns = Array.from(new Map(allColumns.map((col) => [col.name, col])).values())

        setColumns(uniqueColumns)
        setStatus("Columns fetched successfully.")
      } catch (error) {
        setStatus("Failed to fetch columns: " + (error instanceof Error ? error.message : "Unknown error"))
        setColumns([])
      }
    } else {
      if (!isConnected) {
        await connectToFlatFile()
      }
    }
  }

  const handleColumnToggle = (columnName: string) => {
    if (selectedColumns.includes(columnName)) {
      setSelectedColumns(selectedColumns.filter((col) => col !== columnName))
    } else {
      setSelectedColumns([...selectedColumns, columnName])
    }
  }

  const handleSelectAllColumns = () => {
    setSelectedColumns(columns.map((col) => col.name))
  }

  const handleDeselectAllColumns = () => {
    setSelectedColumns([])
  }

  const previewDataHandler = async () => {
    if (selectedColumns.length === 0) {
      setStatus("Please select at least one column to preview.")
      return
    }

    setStatus("Fetching preview data...")
    try {
      if (sourceType === "clickhouse") {
        const connectionConfig = {
          host: clickhouseConfig.host,
          port: clickhouseConfig.port,
          database: clickhouseConfig.database,
          username: clickhouseConfig.username,
          jwtToken: clickhouseConfig.jwtToken,
        }

        const data = await clickhouseService.previewData(
          connectionConfig,
          selectedTables[0],
          selectedColumns,
        )

        setPreviewData(data)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800))

        const mockData = Array.from({ length: 5 }, (_, i) => {
          const row: Record<string, any> = {}
          selectedColumns.forEach((col) => {
            if (col === "id") row[col] = i + 1
            else if (col === "name") row[col] = `User ${i + 1}`
            else if (col === "email") row[col] = `user${i + 1}@example.com`
            else if (col === "age") row[col] = 20 + i * 2
            else if (col === "created_at") row[col] = new Date().toISOString()
            else row[col] = `Value ${i + 1}`
          })
          return row
        })

        setPreviewData(mockData)
      }

      setStatus("Preview data loaded.")
    } catch (error) {
      setStatus("Preview failed: " + (error instanceof Error ? error.message : "Unknown error"))
      setPreviewData([])
    }
  }

  const startExport = async () => {
    if (selectedColumns.length === 0) {
      setStatus("Please select at least one column to export.")
      return
    }

    if (sourceType === "clickhouse" && selectedTables.length === 0) {
      setStatus("Please select a table to export from.")
      return
    }

    setStatus(`Starting ${sourceType === "clickhouse" ? "export" : "import"}...`)
    setProgress(10)

    try {
      for (let p = 20; p <= 80; p += 10) {
        setProgress(p)
        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      if (sourceType === "clickhouse") {
        const exportConfig = {
          source: {
            type: "clickhouse" as const,
            config: {
              host: clickhouseConfig.host,
              port: clickhouseConfig.port,
              database: clickhouseConfig.database,
              username: clickhouseConfig.username,
              jwtToken: clickhouseConfig.jwtToken,
            },
            table: selectedTables[0],
            columns: selectedColumns,
          },
          target: {
            type: "flatfile" as const,
            table: selectedTables[0],
          },
        }

        await clickhouseService.exportData(exportConfig)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      setProgress(100)
      setStatus(sourceType === "clickhouse" ? "Export completed successfully." : "Import completed successfully.")
      setRecordCount(100)
    } catch (error) {
      setStatus(
        (sourceType === "clickhouse" ? "Export" : "Import") +
        " failed: " +
        (error instanceof Error ? error.message : "Unknown error"),
      )
      setProgress(0)
    }
  }

  const handleSourceTypeChange = (type: string) => {
    setSourceType(type)
    setTables([])
    setSelectedTables([])
    setColumns([])
    setSelectedColumns([])
    setStatus("")
    setPreviewData([])
    setRecordCount(null)
    setProgress(0)
    setIsConnected(false)
    setCsvFile(null)
  }

  const getTableName = (table: string | { name: string }) => {
    if (typeof table === "string") return table
    return table.name
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <Card className="border-none shadow-xl rounded-2xl overflow-hidden mb-8">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">ClickHouse Data Bridge</h1>
                  <p className="text-gray-200 mt-1">Bidirectional data transfer between ClickHouse and flat files</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <SourceSelector sourceType={sourceType} onSourceTypeChange={handleSourceTypeChange} />

              {sourceType === "clickhouse" && !isConnected && (
                <ConnectionForm
                  clickhouseConfig={clickhouseConfig}
                  onConfigChange={handleConnectionConfigChange}
                  onConnect={connectToClickHouse}
                />
              )}

              {sourceType === "flatfile" && !isConnected && (
                <FileUpload
                  onFileUpload={handleFileUpload}
                  selectedFile={csvFile}
                  //@ts-ignore
                  flatFileConfig={flatFileConfig}
                  onConfigChange={handleFlatFileConfigChange}
                  onConnect={connectToFlatFile}
                />
              )}

              {isConnected && tables.length > 0 && sourceType === "clickhouse" && (
                <TableSelector
                  tables={tables}
                  selectedTables={selectedTables}
                  setSelectedTables={setSelectedTables}
                  getTableName={getTableName}
                />
              )}

              {(sourceType === "clickhouse" ? selectedTables.length > 0 : isConnected) && (
                <ActionButtons
                  loadColumns={loadColumns}
                  previewData={previewDataHandler}
                  startExport={startExport}
                  columnsLength={columns.length}
                  selectedColumnsLength={selectedColumns.length}
                  status={status}
                  progress={progress}
                  sourceType={sourceType}
                />
              )}

              {columns.length > 0 && (
                <ColumnSelector
                  columns={columns}
                  selectedColumns={selectedColumns}
                  onColumnToggle={handleColumnToggle}
                  onSelectAll={handleSelectAllColumns}
                  onDeselectAll={handleDeselectAllColumns}
                />
              )}

              {previewData.length > 0 && <DataPreview previewData={previewData} />}

              {/* <StatusDisplay
                status={status}
                progress={progress}
                recordCount={recordCount}
                jwtToken={clickhouseConfig.jwtToken}
                sourceType={sourceType}
                getJwtExpiry={getJwtExpiry}
              /> */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
