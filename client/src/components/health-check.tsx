import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export function HealthCheck() {
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          setStatus('ok');
        } else {
          setStatus('error');
          setError(`Server responded with ${response.status}: ${response.statusText}`);
        }
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    checkHealth();
  }, []);

  if (status === 'ok') {
    return null; // Don't show anything if everything is working
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-80">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            {status === 'checking' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm">Checking server connection...</span>
              </>
            )}
            {status === 'error' && (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <div className="text-sm">
                  <div className="font-medium text-red-700">Server Error</div>
                  <div className="text-gray-600">{error}</div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}