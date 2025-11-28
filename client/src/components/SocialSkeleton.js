import React from 'react';
import { Skeleton } from './ui/Skeleton';

const SocialSkeleton = () => {
    return (
        <div className="p-6 h-full flex space-x-6 overflow-hidden">
            {/* Main Feed */}
            <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                {/* Create Post Input */}
                <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700">
                    <div className="flex space-x-4 mb-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-10 flex-1 rounded-full" />
                    </div>
                    <div className="flex justify-between">
                        <div className="flex space-x-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                </div>

                {/* Posts */}
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div>
                                    <Skeleton className="h-4 w-32 mb-1" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-6 w-6 rounded-full" />
                        </div>

                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-4" />

                        <div className="flex items-center space-x-6 pt-4 border-t border-gray-700">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Sidebar */}
            <div className="w-80 space-y-6 hidden lg:block">
                {/* Trending Topics */}
                <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex justify-between items-center">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-12" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex-1">
                                    <Skeleton className="h-4 w-24 mb-1" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                                <Skeleton className="h-4 w-12" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialSkeleton;
