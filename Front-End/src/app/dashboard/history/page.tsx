import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import DashboardLayout from "@/app/dashboard/components/dashboard-layout"
import Image from "next/image"
import { Calendar, Download, FileText, Search } from "lucide-react"

// Sample data for purchase history
const purchases = [
  {
    id: "ORD-2023-1001",
    date: "March 15, 2023",
    plan: {
      title: "Suburban Family House",
      image: "/placeholder.svg?height=300&width=500&text=Suburban%20Family%20House",
      category: "Residential",
    },
    total: 599,
    downloadCount: 3,
    lastDownloaded: "April 2, 2023",
  },
  {
    id: "ORD-2023-0875",
    date: "February 28, 2023",
    plan: {
      title: "Commercial Office Building",
      image: "/placeholder.svg?height=300&width=500&text=Commercial%20Office%20Building",
      category: "Commercial",
    },
    total: 1999,
    downloadCount: 5,
    lastDownloaded: "March 20, 2023",
  },
  {
    id: "ORD-2022-2345",
    date: "December 10, 2022",
    plan: {
      title: "Urban Apartment Complex",
      image: "/placeholder.svg?height=300&width=500&text=Urban%20Apartment%20Complex",
      category: "Multi-family",
    },
    total: 1299,
    downloadCount: 8,
    lastDownloaded: "March 5, 2023",
  },
  {
    id: "ORD-2022-1987",
    date: "November 5, 2022",
    plan: {
      title: "Modern Minimalist Home",
      image: "/placeholder.svg?height=300&width=500&text=Modern%20Minimalist%20Home",
      category: "Residential",
    },
    total: 499,
    downloadCount: 2,
    lastDownloaded: "January 15, 2023",
  },
]

export default function PurchaseHistoryPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Purchase History</h1>
          <p className="text-muted-foreground">View and download your previously purchased architectural plans.</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Select defaultValue="all-time">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground hidden sm:inline">{purchases.length} purchases</span>
          </div>
          <div className="w-full sm:w-auto relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search purchases..." className="w-full sm:w-[250px] pl-8" />
          </div>
        </div>

        <div className="space-y-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <CardTitle className="text-lg">{purchase.id}</CardTitle>
                    <CardDescription>Purchased on {purchase.date}</CardDescription>
                  </div>
                  <Badge variant="outline" className="border-green-500 text-green-500">
                    Completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative aspect-video w-full sm:w-48 rounded-md overflow-hidden">
                    <Image
                      src={purchase.plan.image || "/placeholder.svg"}
                      alt={purchase.plan.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold">{purchase.plan.title}</h3>
                    <p className="text-sm text-muted-foreground">Category: {purchase.plan.category}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>Complete plan set with all documents</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Last downloaded: {purchase.lastDownloaded}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Download count:</span> {purchase.downloadCount} of unlimited
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">${purchase.total}</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4 bg-muted/50">
                <Button variant="outline" size="sm">
                  View Receipt
                </Button>
                <Button size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download Files
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Purchase Summary</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Purchases</span>
                  <span>{purchases.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Spent</span>
                  <span className="font-bold">${purchases.reduce((sum, purchase) => sum + purchase.total, 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Most Recent Purchase</span>
                  <span>{purchases[0].date}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Most Downloaded Plan</span>
                  <span>{purchases.sort((a, b) => b.downloadCount - a.downloadCount)[0].plan.title}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
