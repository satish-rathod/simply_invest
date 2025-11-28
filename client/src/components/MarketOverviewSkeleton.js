import React from 'react';
import { Skeleton } from './ui/Skeleton';

const MarketOverviewSkeleton = () => {
    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <Skeleton className="h-8 w-48 mr-4" />
                </div>
                <div className="flex items-center">
                    <Skeleton className="h-10 w-48 rounded-l-lg" />
                    <Skeleton className="h-10 w-12 rounded-r-lg ml-1" />
                </div>
            </div>

            {/* Chart Section */}
            <div className="mb-6 flex-grow">
                <div className="flex justify-between items-center mb-2">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex space-x-2 bg-gray-700 rounded-lg p-1">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-6 w-8 rounded-md" />
                        ))}
                    </div>
                </div>
                <div className="bg-gray-900 rounded-xl p-4 h-96">
                    <Skeleton className="w-full h-full rounded-lg" />
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-auto">
                {/* Left Column */}
                <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-3" />
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-start">
                                <Skeleton className="h-3 w-3 mr-2 mt-1" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column */}
                <div className="bg-gray-700 rounded-lg p-4">
                    <Skeleton className="h-6 w-40 mb-3" />
                    <div className="space-y-3">
                        <div className="flex justify-between pb-2 border-b border-gray-600">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex justify-between">
                                <div className="flex flex-col">
                                    <Skeleton className="h-4 w-24 mb-1" />
                                    <Skeleton className="h-3 w-12" />
                                </div>
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketOverviewSkeleton;
