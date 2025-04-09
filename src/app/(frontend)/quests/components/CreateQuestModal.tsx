'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@(frontend)/components/ui/dialog'
import { Button } from '@(frontend)/components/ui/button'
import { Label } from '@(frontend)/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@(frontend)/components/ui/select'
import { QuestProduct, QuestUser } from '@/payload-types'

interface CreateQuestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateQuestModal({ open, onOpenChange }: CreateQuestModalProps) {
  const router = useRouter()
  const [products, setProducts] = useState<QuestProduct[]>([])
  const [users, setUsers] = useState<QuestUser[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Fetch products and users
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [productsResponse, usersResponse] = await Promise.all([
          fetch('/api/quest-products'),
          fetch('/api/quest-users'),
        ])

        if (!productsResponse.ok || !usersResponse.ok) {
          throw new Error('Failed to fetch options')
        }

        const productsData = await productsResponse.json()
        const usersData = await usersResponse.json()

        setProducts(productsData.docs)
        setUsers(usersData.docs)
      } catch (err) {
        console.error('Error fetching options:', err)
        setError('Failed to load products and users. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    if (open) {
      fetchOptions()
    }
  }, [open])

  const handleSubmit = () => {
    if (!selectedProductId || !selectedUserId) {
      return
    }

    // Show loading modal
    setIsRedirecting(true)

    // Redirect after a minimum of 2 seconds
    setTimeout(() => {
      router.push(`/quests/create?productId=${selectedProductId}&userId=${selectedUserId}`)
    }, 2000)
  }

  return (
    <>
      {/* Product/User Selection Modal */}
      <Dialog open={open && !isRedirecting} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Quest</DialogTitle>
            <DialogDescription>Select a product and user to create a new quest.</DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">{error}</div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product" className="text-right">
                What's the product?
              </Label>
              <div className="col-span-3">
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                  disabled={isLoading || products.length === 0}
                >
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="user" className="text-right">
                Who are you?
              </Label>
              <div className="col-span-3">
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                  disabled={isLoading || users.length === 0}
                >
                  <SelectTrigger id="user">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !selectedProductId || !selectedUserId}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loading Modal */}
      <Dialog open={isRedirecting} onOpenChange={() => {}}>
        {' '}
        {/* Empty onOpenChange to prevent closing */}
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Starting Your Quest</DialogTitle>
            <DialogDescription>Preparing your quest adventure...</DialogDescription>
          </DialogHeader>
          <div className="py-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
