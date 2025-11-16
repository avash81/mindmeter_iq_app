// Performance monitoring utilities for MindMeter IQ App

export class PerformanceMonitor {
  static measurements = new Map();

  static startMeasurement(name) {
    const startTime = performance.now();
    this.measurements.set(name, { startTime });
    return startTime;
  }

  static endMeasurement(name) {
    const measurement = this.measurements.get(name);
    if (!measurement) return null;

    const endTime = performance.now();
    const duration = endTime - measurement.startTime;

    this.measurements.set(name, {
      ...measurement,
      endTime,
      duration,
    });

    // Log slow operations
    if (duration > 1000) {
      console.warn(
        `Slow operation detected: ${name} took ${duration.toFixed(2)}ms`
      );
    }

    return duration;
  }

  static getMeasurement(name) {
    return this.measurements.get(name);
  }

  static getAllMeasurements() {
    return Object.fromEntries(this.measurements);
  }

  static clearMeasurements() {
    this.measurements.clear();
  }
}

// API response time tracking
export const trackApiCall = async (apiCall, endpoint) => {
  PerformanceMonitor.startMeasurement(`api_${endpoint}`);

  try {
    const response = await apiCall();
    PerformanceMonitor.endMeasurement(`api_${endpoint}`);
    return response;
  } catch (error) {
    PerformanceMonitor.endMeasurement(`api_${endpoint}`);
    throw error;
  }
};

// Component render time tracking
export const useRenderTimeTracker = (componentName) => {
  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    if (renderTime > 100) {
      console.warn(
        `Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`
      );
    }
  };
};

// Network status monitoring
export const NetworkMonitor = {
  isOnline: navigator.onLine,

  init() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      console.log("Network: Online");
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      console.warn("Network: Offline");
    });
  },
};
