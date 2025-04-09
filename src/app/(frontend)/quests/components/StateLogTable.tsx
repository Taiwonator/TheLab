'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@(frontend)/components/ui/table'
import { Badge } from '@(frontend)/components/ui/badge'

interface StateLog {
  id: string
  state: string
  timestamp: string
  notes?: string
}

interface StateLogTableProps {
  logs: StateLog[]
}

export function StateLogTable({ logs }: StateLogTableProps) {
  // Sort logs by timestamp (newest first)
  const sortedLogs = [...logs].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })

  // Get state badge color
  const getStateBadgeColor = (state: string) => {
    switch (state) {
      case 'created':
        return 'bg-blue-100 text-blue-800'
      case 'proposing':
        return 'bg-yellow-100 text-yellow-800'
      case 'reviewing':
        return 'bg-purple-100 text-purple-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'denied':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedLogs.length > 0 ? (
            sortedLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">
                  {formatDate(log.timestamp)}
                </TableCell>
                <TableCell>
                  <Badge className={getStateBadgeColor(log.state)}>
                    {log.state.charAt(0).toUpperCase() + log.state.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md">
                  {log.notes || <span className="text-gray-400">No notes</span>}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                No state logs found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
