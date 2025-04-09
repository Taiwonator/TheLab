'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@(frontend)/components/ui/button'
import { Input } from '@(frontend)/components/ui/input'
import { Label } from '@(frontend)/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@(frontend)/components/ui/card'
import { QuestProduct } from '@/payload-types'

export default function CreateQuestPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [overview, setOverview] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [product, setProduct] = useState<QuestProduct | null>(null)
  const [isValidParams, setIsValidParams] = useState(false)

  const productId = searchParams.get('productId')
  const userId = searchParams.get('userId')

  // Validate query parameters
  useEffect(() => {
    const validateParams = async () => {
      if (!productId || !userId) {
        setError('Both productId and userId are required as query parameters')
        setIsValidParams(false)
        return
      }

      try {
        // Fetch product and user to validate they exist
        const productResponse = await fetch(`/api/quest-products/${productId}`)
        const userResponse = await fetch(`/api/quest-users/${userId}`)

        if (!productResponse.ok) {
          setError('Invalid product ID')
          setIsValidParams(false)
          return
        }

        if (!userResponse.ok) {
          setError('Invalid user ID')
          setIsValidParams(false)
          return
        }

        const productData = await productResponse.json()
        await userResponse.json() // Validate user exists

        setProduct(productData)
        setIsValidParams(true)
        setError(null)
      } catch (err) {
        console.error('Error validating parameters:', err)
        setError('Failed to validate parameters')
        setIsValidParams(false)
      }
    }

    validateParams()
  }, [productId, userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidParams) {
      return
    }

    if (!overview.trim()) {
      setError('Overview is required')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Create the quest
      const questResponse = await fetch('/api/quests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          userId,
          overview,
        }),
      })

      if (!questResponse.ok) {
        const errorData = await questResponse.json()
        throw new Error(errorData.error || 'Failed to create quest')
      }

      const questData = await questResponse.json()

      setSuccess('Quest created successfully!')

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/quests/${questData.quest.id}`)
      }, 2000)
    } catch (err) {
      console.error('Error creating quest:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while creating the quest')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Quest</CardTitle>
          <CardDescription>
            {product ? `For product: ${product.name}` : 'Loading product information...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">{error}</div>
          )}
          {success && (
            <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">{success}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="overview">Quest Overview</Label>
                <Input
                  id="overview"
                  placeholder="Describe your quest..."
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  disabled={isLoading || !isValidParams}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isLoading || !isValidParams}>
            {isLoading ? 'Creating...' : 'Create Quest'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
