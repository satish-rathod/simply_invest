import React from 'react';
import { Skeleton } from './ui/Skeleton';

const NewsSkeleton = () => {
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

            {/* Featured News */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 h-full">
                    <Skeleton className="w-full h-64 rounded-lg mb-4" />
                    <div className="flex items-center space-x-2 mb-2">
                        <Skeleton className="h-4 w-20 rounded-full" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-8 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-3/4" />
                </div>

                <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 flex space-x-4">
                            <Skeleton className="w-32 h-24 rounded-lg flex-shrink-0" />
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Skeleton className="h-3 w-16 rounded-full" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-5 w-full mb-2" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
                        <Skeleton className="w-full h-48" />
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-5 w-full mb-2" />
                            <Skeleton className="h-3 w-full mb-1" />
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewsSkeleton;
