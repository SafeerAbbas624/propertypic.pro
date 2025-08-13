import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CloudIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AuthStatus {
  authenticated: boolean;
  message: string;
}

export function GoogleDriveAuth() {
  const queryClient = useQueryClient();

  // Check auth status
  const { data: authStatus, isLoading } = useQuery<AuthStatus>({
    queryKey: ['/auth/status'],
    refetchInterval: 5000, // Check every 5 seconds
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/auth/logout', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Logout failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/auth/status'] });
    },
  });

  const handleConnect = () => {
    window.location.href = '/auth/google';
  };

  const handleDisconnect = () => {
    logoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudIcon className="w-5 h-5" />
            Google Drive Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudIcon className="w-5 h-5" />
          Google Drive Connection
        </CardTitle>
        <CardDescription>
          Connect your Google Drive to store property photos centrally
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {authStatus?.authenticated ? (
            <>
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <Badge variant="default" className="bg-green-100 text-green-800">
                Connected
              </Badge>
            </>
          ) : (
            <>
              <AlertCircleIcon className="w-5 h-5 text-orange-500" />
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Not Connected
              </Badge>
            </>
          )}
        </div>
        
        <p className="text-sm text-gray-600">
          {authStatus?.message || 'Check connection status...'}
        </p>

        <div className="flex gap-2">
          {authStatus?.authenticated ? (
            <Button 
              variant="outline" 
              onClick={handleDisconnect}
              disabled={logoutMutation.isPending}
              className="flex-1"
            >
              {logoutMutation.isPending ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          ) : (
            <Button 
              onClick={handleConnect}
              className="flex-1"
            >
              Connect Google Drive
            </Button>
          )}
        </div>

        {!authStatus?.authenticated && (
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-xs text-blue-700">
              <strong>Owner Setup Required:</strong> All property photos will be stored in your personal Google Drive for centralized management.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}