"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Star, Lock, ShoppingCart, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Review {
  id: number
  author: string
  avatar: string
  rating: number
  comment: string
  date: string
}

interface PlanDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: {
    id: number
    title: string
    description: string
    price: number
    category: string
    squareFeet: number
    bedrooms: number
    bathrooms: number
    image?: string
    uploadedAt?: string
    architect?: string
    architectImage?: string
  }
}

export function PlanDetailModal({ open, onOpenChange, plan }: PlanDetailModalProps) {
  const { toast } = useToast()
 const [selectedImage, setSelectedImage] = useState(plan.image || "")
  const [userRating, setUserRating] = useState(0)
  const [userComment, setUserComment] = useState("")
  const [showAllReviews, setShowAllReviews] = useState(false)

  // Mock data for images and documents
const images = [plan.image || "", plan.image || "", plan.image || ""]
  const documents = [
    { id: 1, name: "Floor_Plan_Level_1.pdf" },
    { id: 2, name: "Floor_Plan_Level_2.pdf" },
    { id: 3, name: "Elevation_Views.pdf" },
    { id: 4, name: "3D_Model.skp" },
    { id: 5, name: "Material_Specifications.pdf" },
  ]

  const mockReviews: Review[] = [
    {
      id: 1,
      author: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40&text=SJ",
      rating: 5,
      comment: "Excellent floor plan! The layout is practical and the aesthetics are modern. Highly recommend this design.",
      date: "2 days ago",
    },
    {
      id: 2,
      author: "Michael Chen",
      avatar: "/placeholder.svg?height=40&width=40&text=MC",
      rating: 4,
      comment: "Great work. The space utilization is impressive. Minor tweaks needed for our specific requirements.",
      date: "1 week ago",
    },
    {
      id: 3,
      author: "Emma Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40&text=ER",
      rating: 5,
      comment: "Perfect! Used this as inspiration for our new building. The architect really understood modern living.",
      date: "2 weeks ago",
    },
    {
      id: 4,
      author: "David Park",
      avatar: "/placeholder.svg?height=40&width=40&text=DP",
      rating: 3,
      comment: "Good design but some cost concerns with the materials specified. Would work with budget adjustments.",
      date: "3 weeks ago",
    },
  ]

  const averageRating = (
    mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length
  ).toFixed(1)

  const handleSubmitReview = () => {
    if (userComment.trim() && userRating > 0) {
      toast({
        title: "Review Posted",
        description: "Thank you for sharing your feedback!",
      })
      setUserComment("")
      setUserRating(0)
    } else {
      toast({
        title: "Missing Information",
        description: "Please add a rating and comment before submitting.",
        variant: "destructive",
      })
    }
  }

  const visibleReviews = showAllReviews ? mockReviews : mockReviews.slice(0, 3)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <DialogTitle className="text-2xl">{plan.title}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-8">
          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Image Gallery */}
            <div className="lg:col-span-1">
              <div className="space-y-3">
                {/* Main Image */}
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100">
                  <Image
                    src={selectedImage}
                    alt={plan.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2">
                  {images.map((img, idx) => (
<button
  key={idx}
  type="button"
  aria-label={`Ver imagem ${idx + 1}`}
  onClick={() => setSelectedImage(img)}
  className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
    selectedImage === img
      ? "border-blue-500"
      : "border-slate-200 hover:border-slate-300"
  }`}
>
                      <Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Plan Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title and Architect */}
              <div>
                <h1 className="text-3xl font-bold mb-4">{plan.title}</h1>
                <div className="flex items-center gap-3 mb-4">
                  {plan.architectImage && (
                    <Image
                      src={plan.architectImage}
                      alt={plan.architect || "Architect"}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-sm">{plan.architect || "Architect"}</p>
                    <p className="text-xs text-muted-foreground">Uploaded {plan.uploadedAt || "Recently"}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">{plan.description}</p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Category</p>
                  <p className="font-semibold">{plan.category}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Size</p>
                  <p className="font-semibold">{plan.squareFeet.toLocaleString()} sq ft</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Bedrooms</p>
                  <p className="font-semibold">{plan.bedrooms}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Bathrooms</p>
                  <p className="font-semibold">{plan.bathrooms}</p>
                </div>
              </div>

              {/* Price and Purchase */}
              <div className="pt-4 border-t space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Available
                  </Badge>
                </div>
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white h-10">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Purchase This Plan
                </Button>
              </div>
            </div>
          </div>

          {/* Documents Section - Locked */}
          <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
            <CardHeader>
              <CardTitle className="text-lg">Project Documents</CardTitle>
              <CardDescription>
                Purchase this plan to unlock all documents and detailed specifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 opacity-75 cursor-not-allowed"
                  >
                    <Lock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-600 flex-1 truncate">
                      {doc.name}
                    </span>
                    <span className="text-xs text-slate-400">Locked</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-600 mt-4 text-center py-2 bg-slate-50 rounded-lg">
                🔒 Purchase this plan to unlock all documents
              </p>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Community Reviews</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(parseFloat(averageRating))
                          ? "fill-blue-500 text-blue-500"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold">{averageRating}</span>
                <span className="text-sm text-muted-foreground">({mockReviews.length} reviews)</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Leave Review Form */}
              <div className="border-b pb-6">
                <h4 className="font-semibold mb-3">Leave Your Review</h4>
                <div className="space-y-3">
                  {/* Rating Selector */}
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                          type="button"
                           aria-label={`Avaliar com ${star} estrela${star > 1 ? "s" : ""}`}
                        onClick={() => setUserRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= userRating
                              ? "fill-blue-500 text-blue-500"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Comment Textarea */}
                  <Textarea
                    placeholder="Share your thoughts about this design..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmitReview}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={!userRating || !userComment.trim()}
                  >
                    Post Review
                  </Button>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {visibleReviews.map((review) => (
                  <div key={review.id} className="pb-4 border-b last:border-b-0">
                    <div className="flex gap-3">
                      <Image
                        src={review.avatar}
                        alt={review.author}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-sm">{review.author}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating
                                      ? "fill-blue-500 text-blue-500"
                                      : "text-slate-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                        <p className="text-sm text-slate-700 mt-2">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* See All Reviews Button */}
                {!showAllReviews && mockReviews.length > 3 && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setShowAllReviews(true)}
                  >
                    See All {mockReviews.length} Reviews
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
