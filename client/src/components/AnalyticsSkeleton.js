import React from 'react';
import { Skeleton } from './ui/Skeleton';

const AnalyticsSkeleton = () => {
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

            {/* Risk & Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
                    <Skeleton className="h-6 w-48 mb-6" />
                    <div className="h-64 flex items-center justify-center">
                        <Skeleton className="h-48 w-48 rounded-full" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="text-center">
                                <Skeleton className="h-4 w-16 mx-auto mb-1" />
                                <Skeleton className="h-6 w-12 mx-auto" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
                    <Skeleton className="h-6 w-48 mb-6" />
                    <div className="h-64">
                        <Skeleton className="w-full h-full rounded-lg" />
                    </div>
                </div>
            </div>

            {/* AI Predictions */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
                <Skeleton className="h-6 w-48 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-gray-700 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-4">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </div>
                            <Skeleton className="h-2 w-full rounded-full mb-2" />
                            <Skeleton className="h-3 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsSkeleton;
