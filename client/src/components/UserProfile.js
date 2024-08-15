import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardContent } from '../components/ui/card';

const UserProfile = ({ user }) => {
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfileData(response.data);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };

        fetchProfileData();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">User Profile</h1>
            <Card>
                <CardHeader>Profile Information</CardHeader>
                <CardContent>
                    {profileData ? (
                        <>
                            <p><strong>Name:</strong> {profileData.name}</p>
                            <p><strong>Email:</strong> {profileData.email}</p>
                            {/* Add more profile information as needed */}
                        </>
                    ) : (
                        <p>Loading profile data...</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default UserProfile;