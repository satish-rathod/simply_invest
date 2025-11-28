import React from 'react';
import { Skeleton } from './ui/Skeleton';

const DashboardSkeleton = () => {
    return (
        <div className="h-full flex flex-col overflow-hidden p-6 space-y-6">
            {/* Top Row: Portfolio Summary & Market Overview */}
            <div className="flex h-1/2 space-x-6">
                {/* Virtual Portfolio Summary Skeleton */}
                <div className="w-1/3 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-7 w-40" />
                        <Skeleton className="h-10 w-10 rounded-lg" />
                    </div>

                    <div className="flex flex-col h-full space-y-4">
                        {/* Main Stats */}
                        <div className="space-y-3">
                            <div>
                                <Skeleton className="h-4 w-24 mb-1" />
                                <Skeleton className="h-9 w-48" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </div>

                        {/* Secondary Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                                <Skeleton className="h-3 w-16 mb-2" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                                <Skeleton className="h-3 w-16 mb-2" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                        </div>

                        {/* Top Performers */}
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="space-y-2">
                                {[1, 2].map((i) => (
                                    <div key={i} className="flex items-center justify-between bg-gray-900/30 rounded-lg p-2 border border-gray-700/50">
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-8 w-1.5 rounded-full" />
                                            <div>
                                                <Skeleton className="h-4 w-12 mb-1" />
                                                <Skeleton className="h-3 w-8" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Market Overview Skeleton */}
                <div className="w-2/3 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-7 w-40" />
                        <Skeleton className="h-10 w-10 rounded-lg" />
                    </div>
                    <div className="flex-grow bg-gray-900/30 rounded-lg p-4">
                        <div className="flex items-end justify-between h-full space-x-2">
                            {[...Array(12)].map((_, i) => (
                                <Skeleton key={i} className={`w-full rounded-t-sm h-[${Math.floor(Math.random() * 60 + 20)}%]`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Recent Activity & Recommendations */}
            <div className="flex h-1/2 space-x-6">
                {/* Recent Activity Skeleton */}
                <div className="w-2/3 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-10 w-10 rounded-lg" />
                    </div>
                    <div className="flex-grow overflow-hidden">
                        <div className="space-y-4">
                            {/* Table Header */}
                            <div className="flex justify-between pb-2 border-b border-gray-700">
                                {[...Array(6)].map((_, i) => (
                                    <Skeleton key={i} className="h-4 w-16" />
                                ))}
                            </div>
                            {/* Table Rows */}
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex justify-between py-2 border-b border-gray-700/50">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-12" />
                                    <Skeleton className="h-5 w-16 rounded" />
                                    <Skeleton className="h-4 w-8" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recommendations Skeleton */}
                <div className="w-1/3 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-7 w-40" />
                        <Skeleton className="h-10 w-10 rounded-lg" />
                    </div>
                    <div className="flex-grow space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div>
                                            <Skeleton className="h-5 w-16 mb-1" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                                <Skeleton className="h-4 w-full mt-2" />
                                <div className="flex justify-between mt-3">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
