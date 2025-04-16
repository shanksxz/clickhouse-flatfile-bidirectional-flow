import { ChangeEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Database, Loader } from "lucide-react"
import type { ClickHouseConnection } from "@/utils/api"

type ConnectionFormProps = {
  clickhouseConfig: ClickHouseConnection
  onConfigChange: (e: ChangeEvent<HTMLInputElement>) => void
  onConnect: () => Promise<void>
  title?: string
}

export default function ConnectionForm({ 
  clickhouseConfig, 
  onConfigChange, 
  onConnect,
  title = "ClickHouse Connection"
}: ConnectionFormProps) {
  const isFormValid = 
    clickhouseConfig.host && 
    clickhouseConfig.port && 
    clickhouseConfig.database && 
    clickhouseConfig.username && 
    clickhouseConfig.jwtToken
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <label htmlFor="host" className="text-sm font-medium">
              Host
            </label>
            <Input
              id="host"
              name="host"
              value={clickhouseConfig.host}
              onChange={onConfigChange}
              placeholder="localhost"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="port" className="text-sm font-medium">
              Port
            </label>
            <Input
              id="port"
              name="port"
              value={clickhouseConfig.port}
              onChange={onConfigChange}
              placeholder="8123"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="database" className="text-sm font-medium">
              Database
            </label>
            <Input
              id="database"
              name="database"
              value={clickhouseConfig.database}
              onChange={onConfigChange}
              placeholder="default"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <Input
              id="username"
              name="username"
              value={clickhouseConfig.username}
              onChange={onConfigChange}
              placeholder="default"
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="jwtToken" className="text-sm font-medium">
              JWT Token
            </label>
            <Input
              id="jwtToken"
              name="jwtToken"
              type="password"
              value={clickhouseConfig.jwtToken}
              onChange={onConfigChange}
              placeholder="JWT token"
              required
            />
          </div>
        </div>
        
        <Button 
          className="w-full" 
          onClick={onConnect}
          disabled={!isFormValid}
        >
          <Database className="h-4 w-4 mr-2" />
          Connect
        </Button>
      </CardContent>
    </Card>
  )
}