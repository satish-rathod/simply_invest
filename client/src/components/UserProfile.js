import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Mail, Calendar, Activity, Star, Settings, Edit } from 'lucide-react';
import ProfileSkeleton from './ProfileSkeleton';
import config from '../config';

const UserProfile = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // const [isEditing, setIsEditing] = useState(false);
    // const [editForm, setEditForm] = useState({
    //     username: '',
    //     email: '',
    //     bio: ''
    // });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${config.API_URL}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfileData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile data:', error);
            setError('Failed to load profile data. Please try again later.');
            setLoading(false);
        }
    };

    if (loading) {
        return <ProfileSkeleton />;
    }

    if (error) {
        return (
            <div className="text-center text-red-500 p-4 bg-red-100 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <motion.div
            className="p-6 bg-gray-900 min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <h1 className="text-3xl font-bold mb-6 text-white">User Profile</h1>

            <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center mb-6">
                    <img
                        src={'https://via.placeholder.com/150'}
                        alt="Profile"
                        className="w-24 h-24 rounded-full mr-6"
                    />
                    <div>
                        <h2 className="text-2xl font-semibold text-white">{profileData.name}</h2>
                        <p className="text-gray-400">Financial Enthusiast</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem icon={<User />} label="Username" value={profileData.username || 'Not set'} />
                    <InfoItem icon={<Mail />} label="Email" value={profileData.email} />
                    <InfoItem icon={<Calendar />} label="Joined" value={new Date(profileData.createdAt).toLocaleDateString()} />
                    <InfoItem icon={<Activity />} label="Last Active" value={profileData.lastActive ? new Date(profileData.lastActive).toLocaleDateString() : 'Recently'} />
                    {profileData.bio && (
                        <div className="col-span-1 md:col-span-2 mt-4">
                            <h3 className="text-sm text-gray-500 mb-1">Bio</h3>
                            <p className="text-gray-300">{profileData.bio}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AccountStats />
                <RecentActivity />
            </div>

            <div className="mt-6 flex justify-end">
                <Link to="/settings" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center">
                    <Edit size={16} className="mr-2" />
                    Edit Profile
                </Link>
            </div>
        </motion.div>
    );
};

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-center text-gray-300">
        {React.cloneElement(icon, { size: 20, className: "mr-3 text-gray-500" })}
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    </div>
);

const AccountStats = () => (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Account Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
            <StatItem icon={<Star />} label="Portfolio Value" value="$10,245" />
            <StatItem icon={<Activity />} label="Total Trades" value="127" />
            <StatItem icon={<Settings />} label="Risk Level" value="Moderate" />
            <StatItem icon={<Calendar />} label="Member Since" value="2 years" />
        </div>
    </div>
);

const StatItem = ({ icon, label, value }) => (
    <div className="flex items-center">
        <div className="bg-blue-600 p-2 rounded-md mr-3">
            {React.cloneElement(icon, { size: 20, className: "text-white" })}
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-semibold text-white">{value}</p>
        </div>
    </div>
);

const RecentActivity = () => (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
        <ul className="space-y-3">
            <ActivityItem action="Bought" stock="AAPL" amount="10 shares" date="2023-05-15" />
            <ActivityItem action="Sold" stock="GOOGL" amount="5 shares" date="2023-05-12" />
            <ActivityItem action="Dividend Received" stock="MSFT" amount="$25.50" date="2023-05-10" />
        </ul>
    </div>
);

const ActivityItem = ({ action, stock, amount, date }) => (
    <li className="flex items-center justify-between text-gray-300">
        <div>
            <span className="font-medium">{action}</span> {stock} - {amount}
        </div>
        <span className="text-sm text-gray-500">{date}</span>
    </li>
);

export default UserProfile;