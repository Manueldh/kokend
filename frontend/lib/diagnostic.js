// Diagnostic script to check API connectivity
console.log('🔍 Kokend API Diagnostic');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

async function checkAPI() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  try {
    console.log(`\n📡 Testing API connection to: ${apiUrl}`);
    
    const response = await fetch(`${apiUrl}/`);
    const data = await response.json();
    
    console.log('✅ API Response:', data);
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
  } catch (error) {
    console.error('❌ API Connection failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run diagnostic if this is executed directly
if (typeof window !== 'undefined') {
  checkAPI();
}

export default checkAPI;