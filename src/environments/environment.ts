export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  appName: 'Bordados App',
  version: '1.0.0',
  // Feature flags
  enableAnalytics: false,
  enableDebugMode: true,
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