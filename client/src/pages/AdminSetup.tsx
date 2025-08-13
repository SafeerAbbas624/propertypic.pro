import { GoogleDriveAuth } from '@/components/GoogleDriveAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, CloudIcon } from 'lucide-react';
import { Link } from 'wouter';

export function AdminSetup() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/home">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Admin Setup
            </h1>
            <p className="text-gray-600">Configure ProxyPics for property documentation</p>
          </div>
        </div>

        {/* Google Drive Setup Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudIcon className="w-5 h-5 text-blue-500" />
              Google Drive Integration (Optional)
            </CardTitle>
            <CardDescription>
              Enhance your workflow with cloud backup and easy sharing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
              <h3 className="font-semibold text-green-900 mb-2">✅ Default Storage:</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Files are automatically saved to your local MediaVault database</li>
                <li>• Browse and download through the built-in file explorer</li>
                <li>• No external accounts required - works immediately</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">🚀 Optional Google Drive Benefits:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Automatic cloud backup of all property photos</li>
                <li>• Easy sharing with clients via Google Drive links</li>
                <li>• Organized folder structure in your personal Drive</li>
                <li>• Access files from anywhere, any device</li>
                <li>• You maintain full control and ownership</li>
              </ul>
            </div>

            <GoogleDriveAuth />

            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-800">
                <strong>One-time Setup:</strong> After connecting your Google Drive, all future property photo uploads 
                will automatically go to your Drive account. Users don't need their own Google accounts.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Database</span>
                <span className="text-sm text-green-600">Connected</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">File Upload</span>
                <span className="text-sm text-green-600">Enabled</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">Mobile Camera Access</span>
                <span className="text-sm text-green-600">Supported</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>After connecting Google Drive</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <strong>Create Property Leads:</strong> Add new properties through the main form
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <strong>Share Upload Links:</strong> Send the unique link to photographers/inspectors
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <strong>Monitor Progress:</strong> Check your Google Drive for organized property photos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center pt-4">
          <Link href="/home">
            <Button>
              Return to Main App
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}