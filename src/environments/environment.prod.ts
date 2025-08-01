export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com', // Change this to your actual production API URL
  appName: 'Bordados App',
  version: '1.0.0',
  // Feature flags
  enableAnalytics: true,
  enableDebugMode: false,
  // API endpoints
  endpoints: {
    customers: '/customers',
    orders: '/orders',
    products: {
      embroided: '/embroidedProducts',
      customizable: '/customizableProducts'
    },
    hilados: '/hilados',
    coupons: '/coupons',
    settings: '/settings'
  }
}; 