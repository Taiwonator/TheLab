'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/app/(frontend)/_components/ui/button'
import { Input } from '@/app/(frontend)/_components/ui/input'
import { Spinner } from '@/app/(frontend)/_components/ui/spinner'
import { Label } from '@/app/(frontend)/_components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/app/(frontend)/_components/ui/card'
import { QuestProduct } from '@/payload-types'
import { CreateQuestModal } from '../components/CreateQuestModal'

function CreateQuest() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [overview, setOverview] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [product, setProduct] = useState<QuestProduct | null>(null)
  const [isValidParams, setIsValidParams] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)

  const productId = searchParams.get('productId')
  const userId = searchParams.get('userId')

  // Validate query parameters
  useEffect(() => {
    const validateParams = async () => {
      if (!productId || !userId) {
        // Don't show error when parameters are missing, we'll show the button instead
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

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMediaFiles(Array.from(e.target.files))
    }
  }

  // Remove a file from the selection
  const removeFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Upload media files and return their IDs
  const uploadMediaFiles = async (): Promise<string[]> => {
    if (mediaFiles.length === 0) return []

    setIsUploading(true)
    const mediaIds: string[] = []

    try {
      for (let i = 0; i < mediaFiles.length; i++) {
        const file = mediaFiles[i]
        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', file.name)

        const uploadResponse = await fetch('/api/quest-media/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        const uploadData = await uploadResponse.json()
        mediaIds.push(uploadData.id)

        // Update progress
        setUploadProgress(((i + 1) / mediaFiles.length) * 100)
      }

      return mediaIds
    } finally {
      setIsUploading(false)
    }
  }

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

      // Upload media files if any
      const mediaIds = await uploadMediaFiles()

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
          media: mediaIds.length > 0 ? mediaIds : undefined,
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
      setUploadProgress(0)
    }
  }

  // If no productId or userId is provided, show the shield button
  if (!productId || !userId) {
    return (
      <div className="container min-h-screen mx-auto py-10 flex items-center justify-center">
        <div className="text-center">
          <Button
            onClick={() => setModalOpen(true)}
            size="lg"
            className="px-8 py-6 text-sm flex flex-col items-center gap-4"
          >
            Create Quest 🛡️
          </Button>
          <CreateQuestModal open={modalOpen} onOpenChange={setModalOpen} />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 flex items-center justify-center flex-col gap-4">
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
            <div className="grid w-full items-center gap-6">
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

      <form onSubmit={handleSubmit}>
        <div className="grid w-full items-center gap-6">
          <div className="flex flex-col space-y-1.5">
            <Input
              id="media"
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={isLoading || !isValidParams}
              accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
              className="cursor-pointer"
            />
            <p className="text-xs text-foreground/50 mt-1">
              Supported formats: JPEG, PNG, GIF, WebP, PDF
            </p>
          </div>

          {/* File list */}
          {mediaFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files</Label>
              <div className="border rounded-md p-2 space-y-2">
                {mediaFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                  >
                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={isLoading}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload progress */}
          {isUploading && (
            <div className="space-y-1">
              <div className="text-sm">Uploading files... {Math.round(uploadProgress)}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

export default function CreateQuestPage() {
  // If parameters are provided but invalid, or if valid, show the form
  return (
    <Suspense fallback={<Spinner size="md" />}>
      <CreateQuest />
    </Suspense>
  )
}
