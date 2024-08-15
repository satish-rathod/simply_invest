import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardContent } from '../components/ui/card';

const Dashboard = () => {
  const [marketData, setMarketData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const marketResponse = await axios.get('http://localhost:5000/api/stocks/market-details');
        const recommendationsResponse = await axios.get('http://localhost:5000/api/stocks/recommendations');
        setMarketData(marketResponse.data);
        setRecommendations(recommendationsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Stock Market Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>Market Overview</CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={marketData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="indicesName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Price" stroke="#8884d8" />
                <Line type="monotone" dataKey="priceChange" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Top Recommendations</CardHeader>
          <CardContent>
            <ul>
              {recommendations.slice(0, 5).map((rec, index) => (
                <li key={index} className="mb-2">
                  <strong>{rec.stockName}</strong>: {rec.action} at ₹{rec.tradePrice}
                  <br />
                  <small>Target 1: ₹{rec.target1} | Target 2: ₹{rec.target2} | Stop Loss: ₹{rec.stopLoss}</small>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;