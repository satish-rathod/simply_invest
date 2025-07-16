import Alert from '../models/Alert.js';
import { getStockPrice } from '../utils/marketData.js';
import { sendEmail } from '../utils/email.js';

// Get user's alerts
export const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new alert
export const createAlert = async (req, res) => {
  try {
    const { symbol, type, targetValue } = req.body;
    
    if (!symbol || !type || !targetValue) {
      return res.status(400).json({ message: 'Symbol, type, and target value are required' });
    }

    const alert = new Alert({
      userId: req.user.id,
      symbol: symbol.toUpperCase(),
      type,
      targetValue,
      isActive: true
    });

    await alert.save();
    res.status(201).json(alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update alert
export const updateAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, targetValue } = req.body;

    const alert = await Alert.findOne({ id, userId: req.user.id });
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    if (isActive !== undefined) alert.isActive = isActive;
    if (targetValue !== undefined) alert.targetValue = targetValue;

    await alert.save();
    res.json(alert);
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete alert
export const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    
    const alert = await Alert.findOneAndDelete({ id, userId: req.user.id });
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check and process alerts (called by scheduler)
export const checkAlerts = async () => {
  try {
    const activeAlerts = await Alert.find({ isActive: true, isTriggered: false });
    
    for (const alert of activeAlerts) {
      try {
        let currentValue;
        
        switch (alert.type) {
          case 'PRICE_ABOVE':
          case 'PRICE_BELOW':
            currentValue = await getStockPrice(alert.symbol);
            break;
          case 'VOLUME_SPIKE':
            // Implementation for volume spike detection
            currentValue = 0; // Placeholder
            break;
          case 'NEWS_MENTION':
            // Implementation for news mention detection
            currentValue = 0; // Placeholder
            break;
          default:
            continue;
        }

        alert.currentValue = currentValue;
        
        let triggered = false;
        let message = '';

        if (alert.type === 'PRICE_ABOVE' && currentValue >= alert.targetValue) {
          triggered = true;
          message = `${alert.symbol} has reached your target price of $${alert.targetValue}. Current price: $${currentValue}`;
        } else if (alert.type === 'PRICE_BELOW' && currentValue <= alert.targetValue) {
          triggered = true;
          message = `${alert.symbol} has dropped below your target price of $${alert.targetValue}. Current price: $${currentValue}`;
        }

        if (triggered) {
          alert.isTriggered = true;
          alert.triggeredAt = Date.now();
          alert.message = message;
          alert.isActive = false;

          // Send notification (email, push notification, etc.)
          try {
            // Get user email for notification
            const User = (await import('../models/User.js')).default;
            const user = await User.findById(alert.userId);
            
            if (user && user.email) {
              await sendEmail(user.email, 'Price Alert Triggered', message);
            }
          } catch (notificationError) {
            console.error('Error sending notification:', notificationError);
          }
        }

        await alert.save();
      } catch (error) {
        console.error(`Error processing alert ${alert.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error checking alerts:', error);
  }
};