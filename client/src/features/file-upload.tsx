import { useState, useRef, ChangeEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FileText, Upload, Database, X } from "lucide-react"
import Papa from "papaparse"
import type { FlatFileConfig } from "@/utils/api"

type FileUploadProps = {
  onFileUpload: (file: File, headers: string[], data: Record<string, any>[]) => void
  selectedFile: File | null
  flatFileConfig: FlatFileConfig
  onConfigChange: (e: ChangeEvent<HTMLInputElement>) => void
  onConnect: () => Promise<void>
}

export default function FileUpload({
  onFileUpload,
  selectedFile,
  flatFileConfig,
  onConfigChange,
  onConnect,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const processFile = (file: File) => {
    setIsProcessing(true)
    setParseError(null)
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setParseError("Please upload a CSV file")
      setIsProcessing(false)
      return
    }
    
    Papa.parse<Record<string, any>>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      delimiter: flatFileConfig.delimiter || ',',
      complete: (results) => {
        if (results.errors.length > 0) {
          setParseError(`Error parsing CSV: ${results.errors[0].message}`)
          setIsProcessing(false)
          return
        }
        
        // Get headers from first row
        const headers = results.meta.fields || []
        
        if (headers.length === 0) {
          setParseError("Could not detect columns in the CSV file")
          setIsProcessing(false)
          return
        }
        
        // Pass file and parsed data to parent
        onFileUpload(file, headers, results.data)
        setIsProcessing(false)
      },
      error: (error) => {
        setParseError(`Error parsing CSV: ${error.message}`)
        setIsProcessing(false)
      }
    })
  }

  const clearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onFileUpload(null as unknown as File, [], [])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          CSV File Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept=".csv" 
            onChange={handleFileChange}
          />
          
          {selectedFile ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-10 w-10 text-primary/70" />
              <div className="text-lg font-medium">{selectedFile.name}</div>
              <div className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation()
                  clearFile()
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="text-lg font-medium">Drag & drop your CSV file here</p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
            </div>
          )}
        </div>
        
        {parseError && (
          <div className="text-destructive text-sm p-2 bg-destructive/10 rounded-md">
            {parseError}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="delimiter" className="text-sm font-medium">
              Delimiter
            </label>
            <Input
              id="delimiter"
              name="delimiter"
              value={flatFileConfig.delimiter}
              onChange={onConfigChange}
              placeholder=","
            />
            <p className="text-xs text-muted-foreground">
              Character used to separate values (usually , or ; or tab)
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="target-db" className="text-sm font-medium">
              Target Database
            </label>
            <Input
              id="target-db"
              name="targetDatabase"
            //   value= || ""}
              onChange={onConfigChange}
              placeholder="ClickHouse database name"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="target-table" className="text-sm font-medium">
            Target Table
          </label>
          <Input
            id="target-table"
            name="targetTable"
            // value={flatFileConfig.targetTable || ""}
            onChange={onConfigChange}
            placeholder="ClickHouse table name"
          />
          <p className="text-xs text-muted-foreground">
            The table where data will be imported
          </p>
        </div>
        
        <Button 
          className="w-full" 
          onClick={onConnect}
          disabled={!selectedFile || isProcessing}
        >
          <Database className="h-4 w-4 mr-2" />
          {isProcessing ? "Processing CSV..." : "Process File"}
        </Button>
      </CardContent>
    </Card>
  )
}