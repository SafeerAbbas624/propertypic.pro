import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CloudIcon, CheckCircleIcon, AlertCircleIcon, ExternalLinkIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface AuthStatus {
  authenticated: boolean;
  message: string;
}

export function GoogleDriveStatus() {
  // Check auth status
  const { data: authStatus, isLoading, refetch } = useQuery<AuthStatus>({
    queryKey: ['/auth/status'],
    refetchInterval: 10000, // Check every 10 seconds
  });

  const handleConnect = () => {
    window.open('/auth/google', '_blank', 'width=500,height=600');
    // Refresh status after a delay to check if auth completed
    setTimeout(() => {
      refetch();
    }, 2000);
  };

  if (isLoading) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <CloudIcon className="w-4 h-4" />
        <AlertDescription className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          Checking Google Drive connection...
        </AlertDescription>
      </Alert>
    );
  }

  if (authStatus?.authenticated) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircleIcon className="w-4 h-4 text-green-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-100 text-green-800">
              Google Drive Connected
            </Badge>
            <span className="text-sm text-green-700">
              Ready to receive property photos
            </span>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <CloudIcon className="w-4 h-4 text-blue-600" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Optional Enhancement
              </Badge>
            </div>
            <p className="text-sm text-blue-700 mb-2">
              Files are stored locally. Connect Google Drive for cloud backup and easy sharing.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleConnect}
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <CloudIcon className="w-4 h-4 mr-1" />
              Connect Drive
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}