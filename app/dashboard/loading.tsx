import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
    return (
        <div className="p-6 space-y-6 w-full animate-in fade-in duration-500">
            {/* Welcome Section Skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-[250px] bg-white/5" />
                    <Skeleton className="h-4 w-[350px] bg-white/5" />
                </div>
                <Skeleton className="h-10 w-[140px] bg-white/5" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="glass">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-[100px] bg-white/5" />
                            <Skeleton className="h-4 w-4 rounded-full bg-white/5" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-8 w-[60px] bg-white/5" />
                            <Skeleton className="h-3 w-[120px] bg-white/5" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Posts Skeleton */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="glass h-[400px]">
                    <CardHeader>
                        <Skeleton className="h-6 w-[150px] bg-white/5 mb-2" />
                        <Skeleton className="h-4 w-[250px] bg-white/5" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-start justify-between p-4 rounded-lg glass border border-border/50">
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-5 w-[200px] bg-white/5" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-5 w-16 bg-white/5" />
                                        <Skeleton className="h-5 w-16 bg-white/5" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Quick Actions Skeleton */}
                <Card className="glass h-[400px]">
                    <CardHeader>
                        <Skeleton className="h-6 w-[150px] bg-white/5 mb-2" />
                        <Skeleton className="h-4 w-[200px] bg-white/5" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-10 w-full bg-white/5" />
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
