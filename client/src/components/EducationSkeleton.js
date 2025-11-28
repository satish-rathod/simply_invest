import React from 'react';
import { Skeleton } from './ui/Skeleton';

const EducationSkeleton = () => {
    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="bg-gray-800 rounded-lg p-4 flex space-x-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="text-center">
                            <Skeleton className="h-6 w-12 mx-auto mb-1" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-700 pb-1">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-32 rounded-t-lg" />
                ))}
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
                        <div className="flex items-center space-x-2 mb-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-24 rounded-full" />
                        </div>

                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-2/3 mb-4" />

                        <div className="flex items-center justify-between mb-4">
                            <div className="flex space-x-4">
                                <Skeleton className="h-4 w-12" />
                                <Skeleton className="h-4 w-8" />
                                <Skeleton className="h-4 w-12" />
                            </div>
                        </div>

                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EducationSkeleton;
