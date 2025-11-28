import React from 'react';
import { Skeleton } from './ui/Skeleton';

const ProfileSkeleton = () => {
    return (
        <div className="p-6 bg-gray-900 min-h-screen">
            <Skeleton className="h-8 w-48 mb-6" />

            {/* Profile Header */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
                <div className="flex items-center mb-6">
                    <Skeleton className="w-24 h-24 rounded-full mr-6" />
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center">
                            <Skeleton className="h-5 w-5 mr-3" />
                            <div>
                                <Skeleton className="h-3 w-16 mb-1" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats & Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Stats */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                    <Skeleton className="h-6 w-40 mb-4" />
                    <div className="grid grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center">
                                <Skeleton className="h-10 w-10 rounded-md mr-3" />
                                <div>
                                    <Skeleton className="h-3 w-16 mb-1" />
                                    <Skeleton className="h-5 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                    <Skeleton className="h-6 w-40 mb-4" />
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div>
                                    <Skeleton className="h-5 w-48 mb-1" />
                                </div>
                                <Skeleton className="h-4 w-20" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <Skeleton className="h-10 w-32 rounded-md" />
            </div>
        </div>
    );
};

export default ProfileSkeleton;
