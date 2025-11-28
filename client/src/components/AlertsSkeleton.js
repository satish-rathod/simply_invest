import React from 'react';
import { Skeleton } from './ui/Skeleton';

const AlertsSkeleton = () => {
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

            {/* Alerts Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <Skeleton className="h-3 w-20 mb-1" />
                                <Skeleton className="h-8 w-12" />
                            </div>
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Alerts List */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-4 rounded-lg bg-gray-700 border-l-4 border-gray-600 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <Skeleton className="h-5 w-5 rounded-full" />
                                <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Skeleton className="h-5 w-12" />
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                    <Skeleton className="h-3 w-48" />
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AlertsSkeleton;
