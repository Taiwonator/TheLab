'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@(frontend)/components/ui/card'

export default function GameBoardPage() {
  return (
    <div className="container mx-auto py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Game Board</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-0 overflow-hidden">
          <div className="w-full aspect-[16/9] relative">
            <iframe
              style={{ border: '1px solid rgba(0, 0, 0, 0.1)' }}
              width="100%"
              height="100%"
              src="https://embed.figma.com/board/LjzXIKwZG1Zrc8Hg5ARl7P/MW-UX-OPS?node-id=55-590&embed-host=share"
              allowFullScreen
              className="absolute inset-0"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
