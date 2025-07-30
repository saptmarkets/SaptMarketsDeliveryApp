import { Location, LocationUpdate } from '../types';
import ApiService from './api';

// React Native Geolocation types
interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

interface GeolocationError {
  code: number;
  message: string;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

// Mock geolocation for web/React Native compatibility
const mockGeolocation = {
  getCurrentPosition: (
    success: (position: GeolocationPosition) => void,
    error: (error: GeolocationError) => void,
    options?: GeolocationOptions
  ) => {
    // Mock implementation for development
    setTimeout(() => {
      success({
        coords: {
          latitude: 23.8103,
          longitude: 90.4125,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });
    }, 1000);
  },
  watchPosition: (
    success: (position: GeolocationPosition) => void,
    error: (error: GeolocationError) => void,
    options?: GeolocationOptions
  ): number => {
    return setInterval(() => {
      success({
        coords: {
          latitude: 23.8103 + Math.random() * 0.001,
          longitude: 90.4125 + Math.random() * 0.001,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });
    }, 300000) as unknown as number; // 5 minutes instead of 5 seconds
  },
  clearWatch: (watchId: number) => {
    clearInterval(watchId);
  },
};

class LocationService {
  private watchId: number | null = null;
  private locationUpdateInterval: NodeJS.Timeout | null = null;
  private lastKnownLocation: Location | null = null;
  private geolocation = mockGeolocation;
  private isTracking: boolean = false;
  private lastUpdateTime: number = 0;

  constructor() {}

  // Get current location
  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      this.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          this.lastKnownLocation = location;
          resolve(location);
        },
        (error: GeolocationError) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  // Start watching location changes
  startLocationTracking(): void {
    // Prevent multiple tracking sessions
    if (this.isTracking) {
      // Disable logging to prevent spam
      // console.log('Location tracking already active');
      return;
    }

    this.stopLocationTracking(); // Stop any existing tracking
    this.isTracking = true;

    // Disable logging to prevent spam
    // console.log('Starting location tracking...');

    this.watchId = this.geolocation.watchPosition(
      (position: GeolocationPosition) => {
        const location: LocationUpdate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
        };
        
        this.lastKnownLocation = location;
        // Send location update (throttling is handled in sendLocationUpdate method)
        this.sendLocationUpdate(location);
      },
      (error: GeolocationError) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );

    // Send periodic updates every 5 minutes (less frequent)
    this.locationUpdateInterval = setInterval(() => {
      if (this.lastKnownLocation && this.isTracking) {
        this.sendLocationUpdate(this.lastKnownLocation);
      }
    }, 300000); // 5 minutes instead of 2 minutes
  }

  // Stop location tracking
  stopLocationTracking(): void {
    if (this.watchId !== null) {
      this.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
      this.locationUpdateInterval = null;
    }

    this.isTracking = false;
    // Disable logging to prevent spam
    // console.log('Location tracking stopped');
  }

  // Send location update to server
  private async sendLocationUpdate(location: LocationUpdate): Promise<void> {
    try {
      // Throttle location updates - only send if at least 5 minutes have passed
      const now = Date.now();
      if (now - this.lastUpdateTime < 300000) { // 5 minutes
        return; // Skip this update
      }

      // Check if user is authenticated before sending location
      const isAuth = await ApiService.isAuthenticated();
      if (!isAuth) {
        // Skip location update if not authenticated
        return;
      }

      await ApiService.updateLocation(location);
      this.lastUpdateTime = now;
      // Disable all console logging to prevent spam
      // console.log('Location updated successfully');
    } catch (error: any) {
      const errorMessage = error.message || error.toString();
      
      // Disable error logging to prevent console spam
      // console.error('Failed to send location update:', errorMessage);
      
      // Don't throw the error to prevent app crashes
      // Location updates are not critical for basic app functionality
    }
  }

  // Calculate distance between two points (in kilometers)
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Convert degrees to radians
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get last known location
  getLastKnownLocation(): Location | null {
    return this.lastKnownLocation;
  }

  // Format location for display
  formatLocation(location: Location): string {
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  }

  // Get location permission status
  async getLocationPermissionStatus(): Promise<'granted' | 'denied' | 'prompt'> {
    // This would use react-native-permissions in a real app
    return 'granted';
  }

  // Request location permission
  async requestLocationPermission(): Promise<boolean> {
    try {
      const location = await this.getCurrentLocation();
      return !!location;
    } catch (error) {
      return false;
    }
  }

  // Open maps app with directions
  openMapsWithDirections(destinationLat: number, destinationLng: number): void {
    const destination = `${destinationLat},${destinationLng}`;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    
    // In React Native, you would use Linking.openURL
    console.log('Would open maps with URL:', mapsUrl);
  }
}

export default new LocationService(); 