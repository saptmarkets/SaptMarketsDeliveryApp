# Delivery App Login Troubleshooting Guide

## Test Credentials

**Driver Account:**
- Email: `driver@saptmarkets.com`
- Password: `password123`

## Common Issues & Solutions

### 1. "Login Failed" Error

**Possible Causes:**
- Wrong credentials (most common)
- Server not running
- Network configuration issue
- Database connection issue

**Solutions:**
1. **Check Credentials:** Use the test credentials above
2. **Verify Server:** Ensure backend server is running on port 5055
3. **Check Network:** Verify API_BASE_URL in `src/config/apiConfig.js`

### 2. Network Configuration

**For Android Emulator:**
```javascript
export const API_BASE_URL = 'http://10.0.2.2:5055/api';
```

**For Physical Android Device:**
```javascript
export const API_BASE_URL = 'http://YOUR_COMPUTER_IP:5055/api';
// Replace YOUR_COMPUTER_IP with your actual IP (e.g., 192.168.1.100)
```

**For iOS Simulator:**
```javascript
export const API_BASE_URL = 'http://localhost:5055/api';
```

### 3. Server Status Check

**Check if server is running:**
```powershell
netstat -an | findstr :5055
```

**Start server if not running:**
```powershell
cd backend
node start-server.js
```

### 4. Database Connection

**Verify MongoDB is running:**
```powershell
cd backend
node quick-add-driver.js
```

### 5. Create New Driver Account

If needed, create a new driver account:
```powershell
cd backend
node quick-add-driver.js
```

## API Endpoints

The app uses these endpoints:
- Login: `POST /api/mobile-delivery/login`
- Orders: `GET /api/mobile-delivery/orders`
- Profile: `GET /api/mobile-delivery/profile`

## Debug Steps

1. **Test API directly:**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:5055/api/mobile-delivery/login" -Method POST -Body '{"email":"driver@saptmarkets.com","password":"password123"}' -ContentType "application/json"
   ```

2. **Check server logs** for any errors when attempting login

3. **Verify driver exists in database** using MongoDB Compass or similar tool

## Getting Your Computer's IP Address

**Windows:**
```powershell
ipconfig | findstr IPv4
```

**macOS/Linux:**
```bash
ifconfig | grep inet
```

## Still Having Issues?

1. Check server console for error messages
2. Verify MongoDB is running and accessible
3. Ensure all dependencies are installed (`npm install`)
4. Try recreating the driver account
5. Check firewall settings (port 5055 should be accessible) 