import React from 'react';
import { Skeleton } from './ui/Skeleton';

const PortfolioSkeleton = () => {
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <Skeleton className="h-4 w-24 mb-1" />
                                <Skeleton className="h-8 w-32" />
                            </div>
                            <Skeleton className="h-10 w-10 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
                    <Skeleton className="h-6 w-48 mb-6" />
                    <div className="h-64 flex items-center justify-center">
                        <Skeleton className="h-48 w-48 rounded-full" />
                    </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
                    <Skeleton className="h-6 w-48 mb-6" />
                    <div className="h-64">
                        <Skeleton className="w-full h-full rounded-lg" />
                    </div>
                </div>
            </div>

            {/* Holdings Table */}
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                    <Skeleton className="h-6 w-32" />
                </div>
                <div className="p-6">
                    <div className="flex justify-between mb-4">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-4 w-20" />
                        ))}
                    </div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-700/50">
                                <div className="flex items-center">
                                    <Skeleton className="h-8 w-8 rounded-full mr-3" />
                                    <div>
                                        <Skeleton className="h-4 w-16 mb-1" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                                <div className="flex space-x-2">
                                    <Skeleton className="h-8 w-8 rounded" />
                                    <Skeleton className="h-8 w-8 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortfolioSkeleton;
