import { useState, useEffect } from 'react';
import { apiService } from '../lib/apiService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

export function ApiTest() {
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resources, setResources] = useState<any[]>([]);

  const testApi = async () => {
    setApiStatus('loading');
    setErrorMessage(null);
    
    try {
      // Try to fetch resources as a simple API test
      const resources = await apiService.getResources();
      setResources(resources);
      setApiStatus('success');
    } catch (error: any) {
      console.error('API test failed:', error);
      setApiStatus('error');
      setErrorMessage(error.message || 'Unknown error');
    }
  };

  useEffect(() => {
    // Test the API when the component mounts
    testApi();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>API Connection Test</CardTitle>
        <CardDescription>
          Testing connection to Spring Boot API at {import.meta.env.VITE_API_URL || 'http://localhost:8080'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {apiStatus === 'loading' && <p>Testing API connection...</p>}
        {apiStatus === 'success' && (
          <div>
            <p className="text-green-600 font-medium">✅ API connection successful!</p>
            <p className="mt-2">Found {resources.length} resources</p>
            {resources.length > 0 && (
              <ul className="mt-2 list-disc pl-5">
                {resources.slice(0, 5).map((resource: any) => (
                  <li key={resource.id}>
                    {resource.resourceType} - {resource.inventoryNumber}
                  </li>
                ))}
                {resources.length > 5 && <li>...and {resources.length - 5} more</li>}
              </ul>
            )}
          </div>
        )}
        {apiStatus === 'error' && (
          <div>
            <p className="text-red-600 font-medium">❌ API connection failed</p>
            {errorMessage && <p className="mt-2 text-sm">{errorMessage}</p>}
            <p className="mt-4 text-sm">
              Make sure the Spring Boot backend is running at{' '}
              {import.meta.env.VITE_API_URL || 'http://localhost:8080'}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={testApi} disabled={apiStatus === 'loading'}>
          {apiStatus === 'loading' ? 'Testing...' : 'Test Again'}
        </Button>
      </CardFooter>
    </Card>
  );
}