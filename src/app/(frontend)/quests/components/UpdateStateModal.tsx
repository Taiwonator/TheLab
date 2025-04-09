'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@(frontend)/components/ui/dialog'
import { Button } from '@(frontend)/components/ui/button'
import { Textarea } from '@(frontend)/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@(frontend)/components/ui/select'
import { Label } from '@(frontend)/components/ui/label'

interface UpdateStateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questId: string
  currentState: string
  onStateUpdated: () => void
}

export function UpdateStateModal({
  open,
  onOpenChange,
  questId,
  currentState,
  onStateUpdated,
}: UpdateStateModalProps) {
  const [selectedState, setSelectedState] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get available state options based on current state
  const getStateOptions = () => {
    switch (currentState) {
      case 'created':
        return [
          { label: 'Proposing', value: 'proposing' },
          { label: 'Approved', value: 'approved' },
          { label: 'Denied', value: 'denied' },
        ]
      case 'reviewing':
        return [
          { label: 'Proposing', value: 'proposing' },
          { label: 'Approved', value: 'approved' },
          { label: 'Denied', value: 'denied' },
        ]
      case 'proposing':
        return [{ label: 'Reviewing', value: 'reviewing' }]
      default:
        return []
    }
  }

  const stateOptions = getStateOptions()

  // Check if notes are required (for approved or denied states)
  const isNotesRequired = selectedState === 'approved' || selectedState === 'denied'

  // Reset form when modal opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedState('')
      setNotes('')
      setError(null)
    }
    onOpenChange(open)
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!selectedState) {
        setError('Please select a state')
        return
      }

      if (isNotesRequired && !notes.trim()) {
        setError('Notes are required when approving or denying a quest')
        return
      }

      const response = await fetch(`/api/quests/${questId}/state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: selectedState,
          notes: notes.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update state')
      }

      // Close modal and refresh data
      handleOpenChange(false)
      onStateUpdated()
    } catch (err) {
      console.error('Error updating state:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Quest State</DialogTitle>
          <DialogDescription>
            Change the state of this quest from {currentState}.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="state" className="text-right">
              New State
            </Label>
            <div className="col-span-3">
              <Select
                value={selectedState}
                onValueChange={setSelectedState}
                disabled={isLoading || stateOptions.length === 0}
              >
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {stateOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes {isNotesRequired && <span className="text-red-500">*</span>}
            </Label>
            <div className="col-span-3">
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isNotesRequired ? 'Required for this state change' : 'Optional notes'}
                className="min-h-[100px]"
                disabled={isLoading}
              />
              {isNotesRequired && (
                <p className="text-xs text-muted-foreground mt-1">
                  Notes are required when approving or denying a quest
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !selectedState ||
              (isNotesRequired && !notes.trim())
            }
          >
            {isLoading ? 'Updating...' : 'Update State'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
