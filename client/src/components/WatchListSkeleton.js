import React from 'react';
import { Skeleton } from './ui/Skeleton';

const WatchListSkeleton = () => {
    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>

            {/* Watchlist Tabs */}
            <div className="flex space-x-4 border-b border-gray-700 pb-1">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-24 rounded-t-lg" />
                ))}
            </div>

            {/* Stock Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center">
                                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                                <div>
                                    <Skeleton className="h-5 w-16 mb-1" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            </div>
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>

                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <Skeleton className="h-3 w-12 mb-1" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                            <Skeleton className="h-10 w-24" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                            <div>
                                <Skeleton className="h-3 w-16 mb-1" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <div className="text-right">
                                <Skeleton className="h-3 w-16 mb-1 ml-auto" />
                                <Skeleton className="h-4 w-20 ml-auto" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WatchListSkeleton;
