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
import { Textarea } from '@(frontend)/components/ui/textarea'
import { Badge } from '@(frontend)/components/ui/badge'
import { Spinner } from '@(frontend)/components/ui/spinner'
// import { ShareButton } from '@(frontend)/components/ui/share-button'
import { UpdateStateModal } from '../../components/UpdateStateModal'
import { StateLogTable } from '../../components/StateLogTable'

interface Quest {
  id: string
  overview: string
  proposal?: string
  latestState?: string
  productId: any
  userId: any
  dateCreated: string
}

function QuestProposal() {
  const params = useParams()
  const router = useRouter()
  const [quest, setQuest] = useState<Quest | null>(null)
  const [proposal, setProposal] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [stateLogs, setStateLogs] = useState<any[]>([])
  const [isStateModalOpen, setIsStateModalOpen] = useState(false)
  const [isStateLogsLoading, setIsStateLogsLoading] = useState(false)

  // Fetch quest details and state logs
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

        // Check if quest is in a state where we can view the proposal
        if (!['proposing', 'reviewing', 'approved', 'denied'].includes(questData.latestState)) {
          setError('This quest is not in a state where proposals can be viewed or edited')
          setIsLoading(false)
          return
        }

        // Check if quest is in a state where we can edit the proposal
        const canEdit = questData.latestState === 'proposing'
        if (!canEdit) {
          // We can view but not edit
          if (questData.latestState === 'reviewing') {
            setError('This proposal is currently under review and cannot be edited.')
          } else if (questData.latestState === 'approved') {
            setError('This proposal has been approved and cannot be edited.')
          } else if (questData.latestState === 'denied') {
            setError('This proposal has been denied and cannot be edited.')
          } else {
            setError(
              'This quest is in the ' +
                questData.latestState +
                ' state. Proposals cannot be edited at this stage.',
            )
          }
        }

        setQuest(questData)
        setProposal(questData.proposal || '')

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

    fetchData()
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

  // Handle proposal submission
  const handleSubmit = async () => {
    if (!quest) return

    try {
      setIsSaving(true)
      setSaveSuccess(null)
      setError(null)

      const response = await fetch(`/api/quests/${quest.id}/proposal`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proposal }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save proposal')
      }

      setSaveSuccess('Proposal saved successfully!')

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/quests/${quest.id}`)
      }, 2000)
    } catch (err) {
      console.error('Error saving proposal:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while saving the proposal')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle sending proposal for review
  const handleSendForReview = async () => {
    if (!quest) return

    try {
      // First save the proposal
      setIsSaving(true)
      setSaveSuccess(null)
      setError(null)

      const saveResponse = await fetch(`/api/quests/${quest.id}/proposal`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proposal }),
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        throw new Error(errorData.error || 'Failed to save proposal')
      }

      // Then update the state to reviewing
      const stateResponse = await fetch(`/api/quests/${quest.id}/state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: 'reviewing',
          notes: 'Proposal submitted for review',
        }),
      })

      if (!stateResponse.ok) {
        const errorData = await stateResponse.json()
        throw new Error(errorData.error || 'Failed to update state')
      }

      setSaveSuccess('Proposal sent for review!')

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/quests/${quest.id}`)
      }, 2000)
    } catch (err) {
      console.error('Error sending for review:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while sending the proposal for review',
      )
    } finally {
      setIsSaving(false)
    }
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

  if ((isLoading || !quest) && !error) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Spinner size="lg" />
          <span className="mt-4 text-lg text-gray-600">Loading quest details...</span>
        </div>
      </div>
    )
  } else if (error && !quest) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={() => router.push('/quests')}>
              Back to Quests
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  } else if (!quest) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Quest not found</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={() => router.push('/quests')}>
              Back to Quests
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Write Proposal</CardTitle>
            <CardDescription>
              {quest?.overview.length > 100
                ? `${quest.overview.substring(0, 100)}...`
                : quest?.overview}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* <ShareButton /> */}
            {quest?.latestState && (
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
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Quest Overview</h3>
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-gray-700">{quest?.overview}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">
                {quest?.latestState === 'proposing' ? 'Your Proposal' : 'Proposal'}
              </h3>
              <Textarea
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                placeholder="Write your proposal here..."
                className="min-h-[200px]"
                disabled={isSaving || quest?.latestState !== 'proposing'}
                readOnly={quest?.latestState !== 'proposing'}
              />
            </div>
          </div>
        </CardContent>
        <CardContent className="pt-0">
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">State History</h3>
            {isStateLogsLoading ? (
              <div className="text-center py-4">Loading state logs...</div>
            ) : (
              <StateLogTable logs={stateLogs} />
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div>
            <Button variant="outline" onClick={() => router.push(`/quests/${quest?.id}`)}>
              {quest?.latestState === 'proposing' ? 'Cancel' : 'Back to Quest'}
            </Button>

            {/* Update State button - only show for created or reviewing states */}
            {quest?.latestState && ['created', 'reviewing'].includes(quest.latestState) && (
              <Button
                variant="secondary"
                onClick={() => setIsStateModalOpen(true)}
                className="ml-2"
              >
                Update State
              </Button>
            )}
          </div>

          {quest?.latestState === 'proposing' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSubmit}
                disabled={isSaving || !proposal.trim()}
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>

              <Button onClick={handleSendForReview} disabled={isSaving || !proposal.trim()}>
                {isSaving ? 'Sending...' : 'Send for Review'}
              </Button>
            </div>
          )}
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
    </div>
  )
}

export default function QuestProposalPage() {
  return (
    <Suspense fallback={<Spinner size="md" />}>
      <QuestProposal />
    </Suspense>
  )
}
