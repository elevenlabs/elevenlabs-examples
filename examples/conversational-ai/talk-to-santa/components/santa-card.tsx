import React from 'react'
import { Button } from "@/components/ui/button"
import { Share2 } from 'lucide-react'

interface SantaCardProps {
  name: string
  wishlist: Array<{ key: string; name: string }>
}

export default function SantaCard({ name, wishlist }: SantaCardProps) {
  return (
    <div className="max-w-md mx-auto my-8">
      <div className="relative bg-white p-8 rounded-lg shadow-lg overflow-hidden">
        {/* Candy cane border */}
        <div className="absolute inset-0 bg-red-600 rounded-lg"></div>
        <div className="absolute inset-[4px] bg-white rounded-lg"></div>
        <div className="absolute inset-[8px] bg-red-600 rounded-lg"></div>
        <div className="absolute inset-[12px] bg-white rounded-lg"></div>
        
        {/* Diagonal candy cane stripes */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute top-0 left-0 w-[200%] h-[200%] bg-red-600 bg-opacity-50 transform -rotate-45 origin-top-left"></div>
        </div>
        
        {/* Card content */}
        <div className="relative z-10 font-handwritten text-gray-800">
          <h2 className="text-3xl font-bold mb-4 text-red-600">Dear Santa,</h2>
          <p className="text-xl mb-4">My name is <span className="font-bold underline">{name}</span>.</p>
          <p className="text-xl mb-2">For Christmas, I would like:</p>
          <ul className="list-disc list-inside mb-6 space-y-2">
            {wishlist.map(({name, key}) => (
              <li key={key} className="text-lg">{name}</li>
            ))}
          </ul>
          <p className="text-xl">Thank you, Santa!</p>
        </div>

        {/* Share button */}
        <div className="absolute bottom-4 right-4">
          <Button variant="outline" size="sm" className="bg-white hover:bg-red-50">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
        </div>
      </div>
    </div>
  )
}

