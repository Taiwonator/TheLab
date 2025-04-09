'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@(frontend)/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@(frontend)/components/ui/card'
import { Quest } from '@/payload-types'

export default function QuestDetailPage() {
  const params = useParams()
  const [quest, setQuest] = useState<Quest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuest = async () => {
      try {
        const response = await fetch(`/api/quests/${params.id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch quest')
        }
        
        const data = await response.json()
        setQuest(data)
      } catch (err) {
        console.error('Error fetching quest:', err)
        setError('Failed to load quest details')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchQuest()
    }
  }, [params.id])

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-screen">
        <p>Loading quest details...</p>
      </div>
    )
  }

  if (error || !quest) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error || 'Quest not found'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Quest Details</CardTitle>
          <CardDescription>
            Created on {new Date(quest.dateCreated).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Overview</h3>
              <p className="text-gray-700">{quest.overview}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Product</h3>
              <p className="text-gray-700">
                {typeof quest.productId === 'object' ? quest.productId.name : 'Loading...'}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">User</h3>
              <p className="text-gray-700">
                {typeof quest.userId === 'object' ? quest.userId.name : 'Loading...'}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">AI Labels</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium">Source</p>
                  <p className="text-gray-700">{quest.AILabels?.source || 'None'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <p className="text-gray-700">{quest.AILabels?.type || 'None'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">System</p>
                  <p className="text-gray-700">{quest.AILabels?.system || 'None'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Outcome</p>
                  <p className="text-gray-700">{quest.AILabels?.outcome || 'None'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
