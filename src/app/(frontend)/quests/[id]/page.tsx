'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@(frontend)/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@(frontend)/components/ui/card'
import { Input } from '@(frontend)/components/ui/input'
import { Textarea } from '@(frontend)/components/ui/textarea'
import { Badge } from '@(frontend)/components/ui/badge'
import { Spinner } from '@(frontend)/components/ui/spinner'
import { ShareButton } from '@(frontend)/components/ui/share-button'
import { Quest } from '@/payload-types'
import { UpdateStateModal } from '../components/UpdateStateModal'
import { StateLogTable } from '../components/StateLogTable'

interface QuestWithState extends Quest {
  latestState?: string
}

export default function QuestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [quest, setQuest] = useState<QuestWithState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedOverview, setEditedOverview] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [stateLogs, setStateLogs] = useState<any[]>([])
  const [isStateModalOpen, setIsStateModalOpen] = useState(false)
  const [isStateLogsLoading, setIsStateLogsLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setIsStateLogsLoading(true)
        setError(null)

        // Fetch quest details
        const questResponse = await fetch(`/api/quests/${params.id}`)

        if (!questResponse.ok) {
          throw new Error('Failed to fetch quest')
        }

        const questData = await questResponse.json()
        setQuest(questData)
        setEditedOverview(questData.overview)

        // Fetch state logs
        const logsResponse = await fetch(`/api/quests/${params.id}/state-logs`)

        if (!logsResponse.ok) {
          console.error('Failed to fetch state logs')
        } else {
          const logsData = await logsResponse.json()
          setStateLogs(logsData.docs || [])
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load quest details')
      } finally {
        setIsLoading(false)
        setIsStateLogsLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id])

  // Function to refresh data after state update
  const refreshData = async () => {
    try {
      setIsStateLogsLoading(true)

      // Fetch quest details
      const questResponse = await fetch(`/api/quests/${params.id}`)

      if (questResponse.ok) {
        const questData = await questResponse.json()
        setQuest(questData)
      }

      // Fetch state logs
      const logsResponse = await fetch(`/api/quests/${params.id}/state-logs`)

      if (logsResponse.ok) {
        const logsData = await logsResponse.json()
        setStateLogs(logsData.docs || [])
      }
    } catch (err) {
      console.error('Error refreshing data:', err)
    } finally {
      setIsStateLogsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!quest) return

    try {
      setIsSaving(true)
      setSaveError(null)
      setSaveSuccess(null)

      const response = await fetch(`/api/quests/${quest.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          overview: editedOverview,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update quest')
      }

      const updatedQuest = await response.json()
      setQuest(updatedQuest)
      setIsEditing(false)
      setSaveSuccess('Quest updated successfully')

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(null)
      }, 3000)
    } catch (err) {
      console.error('Error updating quest:', err)
      setSaveError(
        err instanceof Error ? err.message : 'An error occurred while updating the quest',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const canEdit = quest?.latestState === 'created'

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Spinner size="lg" />
          <span className="mt-4 text-md text-gray-600">Loading quest details...</span>
        </div>
      </div>
    )
  }

  if (error || !quest) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || 'Quest not found'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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

  return (
    <Suspense fallback={<Spinner size="md" />}>
      <div className="container mx-auto py-10 grid gap-8">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Quest Details</CardTitle>
              <CardDescription>
                Created on{' '}
                {quest.dateCreated ? new Date(quest.dateCreated).toLocaleDateString() : 'Unknown'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* <ShareButton /> */}
              {quest.latestState && (
                <Badge className={getStateBadgeColor(quest.latestState)}>
                  {quest.latestState.charAt(0).toUpperCase() + quest.latestState.slice(1)}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {saveSuccess && (
              <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">{saveSuccess}</div>
            )}
            {saveError && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
                {saveError}
              </div>
            )}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Overview</h3>
                  {canEdit && !isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                  )}
                </div>
                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editedOverview}
                      onChange={(e) => setEditedOverview(e.target.value)}
                      className="min-h-[100px]"
                      placeholder="Enter quest overview"
                      disabled={isSaving}
                    />
                    <div className="flex space-x-2">
                      <Button onClick={handleSave} disabled={isSaving || !editedOverview.trim()}>
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setEditedOverview(quest.overview)
                          setSaveError(null)
                        }}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700">{quest.overview}</p>
                )}
              </div>

              {/* Proposal - only visible when quest is in proposing state or beyond */}
              {quest.latestState &&
                ['proposing', 'reviewing', 'approved', 'denied'].includes(quest.latestState) && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium">Proposal</h3>
                      {quest.latestState === 'proposing' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/quests/${quest.id}/proposal`)}
                          className="flex items-center gap-1"
                        >
                          Edit <span>✏️</span>
                        </Button>
                      )}
                    </div>
                    {quest.proposal ? (
                      <div
                        className={`p-4 rounded-md ${
                          quest.latestState === 'reviewing'
                            ? 'bg-purple-50 border border-purple-100'
                            : quest.latestState === 'approved'
                              ? 'bg-green-50 border border-green-100'
                              : quest.latestState === 'denied'
                                ? 'bg-red-50 border border-red-100'
                                : 'bg-gray-50'
                        }`}
                      >
                        <p className="text-gray-700">{quest.proposal}</p>
                        {quest.latestState === 'reviewing' && (
                          <div className="mt-2 text-xs text-purple-600 flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            This proposal is currently under review
                          </div>
                        )}
                        {quest.latestState === 'approved' && (
                          <div className="mt-2 text-xs text-green-600 flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            This proposal has been approved
                          </div>
                        )}
                        {quest.latestState === 'denied' && (
                          <div className="mt-2 text-xs text-red-600 flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            This proposal has been denied
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md">
                        No proposal has been written yet.
                        {quest.latestState === 'proposing' && (
                          <Button
                            variant="link"
                            className="p-0 h-auto text-yellow-800 font-medium underline ml-2"
                            onClick={() => router.push(`/quests/${quest.id}/proposal`)}
                          >
                            Write a proposal
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

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

              {/* Media Files */}
              {quest.media && quest.media.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium">Media Files</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {quest.media.map((mediaItem: any) => {
                      const isImage = mediaItem.mimeType?.startsWith('image/')
                      const isPdf = mediaItem.mimeType === 'application/pdf'

                      return (
                        <div key={mediaItem.id} className="border rounded-md overflow-hidden">
                          {isImage ? (
                            <div className="aspect-square relative">
                              <img
                                src={mediaItem.url}
                                alt={mediaItem.alt || mediaItem.title}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ) : isPdf ? (
                            <div className="aspect-square flex items-center justify-center bg-gray-100">
                              <div className="text-center p-4">
                                <svg
                                  className="w-12 h-12 mx-auto text-gray-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <p className="mt-2 text-sm font-medium">PDF Document</p>
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-square flex items-center justify-center bg-gray-100">
                              <div className="text-center p-4">
                                <svg
                                  className="w-12 h-12 mx-auto text-gray-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <p className="mt-2 text-sm font-medium">File</p>
                              </div>
                            </div>
                          )}
                          <div className="p-2 bg-white">
                            <p className="text-sm font-medium truncate">
                              {mediaItem.title || mediaItem.filename}
                            </p>
                            <a
                              href={mediaItem.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View File
                            </a>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => window.history.back()}>
              Back to Quests
            </Button>
          </CardFooter>

          {/* State Update Modal */}
          {quest && (
            <UpdateStateModal
              open={isStateModalOpen}
              onOpenChange={setIsStateModalOpen}
              questId={quest.id}
              currentState={quest.latestState || ''}
              onStateUpdated={refreshData}
            />
          )}
        </Card>
        <Card className="w-full">
          <CardContent>
            {/* State Logs */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">State History</h3>
                {quest.latestState && ['created', 'reviewing'].includes(quest.latestState) && (
                  <Button
                    variant="secondary"
                    onClick={() => setIsStateModalOpen(true)}
                    className="ml-2"
                  >
                    Update State
                  </Button>
                )}
              </div>
              {isStateLogsLoading ? (
                <div className="text-center py-4">Loading state logs...</div>
              ) : (
                <StateLogTable logs={stateLogs} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Suspense>
  )
}
