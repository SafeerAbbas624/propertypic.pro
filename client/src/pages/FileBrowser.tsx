import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Image, Video, FileText, Folder, Search, RefreshCw, ArrowLeft, Home, Eye, Calendar, HardDrive, Upload, Trash2, AlertTriangle, Archive, Camera } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PropertyFolder {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  token: string;
  mediaCount: number;
  createdAt: string;
  propertyType: string;
  isCompleted: boolean;
}

interface MediaFile {
  id: string;
  fileName: string;
  fileType: 'photo' | 'video';
  fileSize?: number;
  fileUrl: string;
  stepTitle: string;
  timestamp: string;
  mimeType?: string;
  isSyncedToGoogleDrive: boolean;
}

export default function FileBrowser() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all property folders
  const { data: propertyFolders, isLoading: foldersLoading, refetch: refetchFolders } = useQuery<PropertyFolder[]>({
    queryKey: ['/api/property-folders'],
    refetchOnWindowFocus: false
  });

  // Get selected property details
  const selectedProperty = propertyFolders?.find(f => f.id === selectedPropertyId);

  // Fetch files for selected property using token
  const { data: mediaFiles, isLoading: filesLoading, refetch: refetchFiles } = useQuery<MediaFile[]>({
    queryKey: [`/api/property-media/${selectedProperty?.token}`, selectedProperty?.token],
    enabled: !!selectedProperty?.token,
    refetchOnWindowFocus: true,
    staleTime: 0 // Always consider data stale to ensure fresh data
  });

  // Delete property folder mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const response = await fetch(`/api/property-folders/${propertyId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete property folder');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Property folder and all files deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/property-folders'] });
      setSelectedPropertyId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete property folder",
        variant: "destructive",
      });
      console.error('Delete property error:', error);
    },
  });

  // Delete media file mutation
  const deleteMediaMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      const response = await fetch(`/api/property-media/${mediaId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete media file');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Media file deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/property-media/${selectedProperty?.token}`, selectedProperty?.token] });
      queryClient.invalidateQueries({ queryKey: ['/api/property-folders'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete media file",
        variant: "destructive",
      });
      console.error('Delete media error:', error);
    },
  });

  const handleBulkDownload = () => {
    if (!selectedProperty) return;

    const link = document.createElement('a');
    link.href = `/api/property-media/${selectedProperty.token}/download-all`;
    const zipFileName = `${selectedProperty.address.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_')}_${selectedProperty.city}_Photos.zip`;
    link.download = zipFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download Started",
      description: "Your ZIP file download has started",
    });
  };

  const filteredFolders = propertyFolders?.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    folder.address.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredFiles = mediaFiles?.filter(file =>
    file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.stepTitle.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'photo': return <Image className="h-5 w-5 text-blue-500" />;
      case 'video': return <Video className="h-5 w-5 text-purple-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'photo': return 'bg-blue-100 text-blue-800';
      case 'video': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (selectedPropertyId) {
                  // If viewing a property folder, go back to folder list
                  setSelectedPropertyId(null);
                } else {
                  // If viewing folder list, go back to home
                  navigate('/home');
                }
              }}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <HardDrive className="w-8 h-8 text-blue-600" />
                MediaVault Explorer
              </h1>
              <p className="text-gray-600 mt-1">Browse and manage all your property media files</p>
            </div>
          </div>
          <Button onClick={() => navigate('/home')} variant="outline">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
          <Home className="w-4 h-4" />
          <span>MediaVault</span>
          {selectedPropertyId && (
            <>
              <span>/</span>
              <span className="font-medium text-gray-900">
                {propertyFolders?.find(f => f.id === selectedPropertyId)?.name}
              </span>
            </>
          )}
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder={selectedPropertyId ? "Search files..." : "Search properties..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Property Folders */}
          {!selectedPropertyId && (
            <div className="lg:col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Folder className="w-5 h-5 text-blue-600" />
                      Property Folders
                    </span>
                    <Badge variant="secondary">
                      {filteredFolders.length} properties
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {foldersLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">Loading properties...</p>
                    </div>
                  ) : filteredFolders.length === 0 ? (
                    <div className="text-center py-12">
                      <Folder className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
                      <p className="text-gray-500 mb-4">
                        {propertyFolders?.length === 0
                          ? "No properties have been created yet."
                          : "No properties match your search."
                        }
                      </p>
                      <Button onClick={() => navigate('/home')} variant="outline">
                        <Home className="w-4 h-4 mr-2" />
                        Create New Property
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredFolders.map((folder) => (
                        <Card
                          key={folder.id}
                          className="hover:shadow-lg transition-all duration-200"
                        >
                          <CardContent className="p-4 relative">
                            {/* Delete button positioned absolutely in top-right corner */}
                            <div className="absolute top-3 right-3 z-10">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 w-8 h-8 p-0 rounded-full"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                      <AlertTriangle className="w-5 h-5 text-red-600" />
                                      Delete Property Folder
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{folder.name}"? This will permanently delete the property folder and all {folder.mediaCount} files inside it. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deletePropertyMutation.mutate(folder.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                      disabled={deletePropertyMutation.isPending}
                                    >
                                      {deletePropertyMutation.isPending ? 'Deleting...' : 'Delete Folder'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>

                            {/* Main card content - clickable area */}
                            <div
                              className="flex items-start gap-3 cursor-pointer pr-10"
                              onClick={() => setSelectedPropertyId(folder.id)}
                            >
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Folder className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">{folder.name}</h3>
                                <p className="text-sm text-gray-500 truncate">
                                  {folder.address}, {folder.city}, {folder.state}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {folder.propertyType}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {folder.mediaCount} files
                                  </Badge>
                                  <Badge
                                    variant={folder.isCompleted ? "default" : "outline"}
                                    className={`text-xs ${folder.isCompleted ? "bg-green-100 text-green-800 border-green-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}`}
                                  >
                                    {folder.isCompleted ? "Complete" : "In Progress"}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                  Created {formatDate(folder.createdAt)}
                                </p>

                                {/* Action buttons */}
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  {!folder.isCompleted ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`/upload/${folder.token}`, '_blank');
                                      }}
                                    >
                                      <Upload className="w-3 h-3 mr-1" />
                                      Continue Upload
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`/upload/${folder.token}`, '_blank');
                                      }}
                                    >
                                      <Camera className="w-3 h-3 mr-1" />
                                      Re-upload Photos
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* File View */}
          {selectedPropertyId && (
            <div className="lg:col-span-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPropertyId(null)}
                        className="p-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Image className="w-5 h-5 text-green-600" />
                          Property Media Files
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {propertyFolders?.find(f => f.id === selectedPropertyId)?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {filteredFiles.length} files
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetchFiles()}
                        disabled={filesLoading}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${filesLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkDownload}
                        disabled={!filteredFiles.length}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        Download All as ZIP
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Folder
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                              Delete Property Folder
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{propertyFolders?.find(f => f.id === selectedPropertyId)?.name}"? This will permanently delete the property folder and all {filteredFiles.length} files inside it. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => selectedPropertyId && deletePropertyMutation.mutate(selectedPropertyId)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deletePropertyMutation.isPending}
                            >
                              {deletePropertyMutation.isPending ? 'Deleting...' : 'Delete Folder'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filesLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">Loading files...</p>
                    </div>
                  ) : filteredFiles.length === 0 ? (
                    <div className="text-center py-12">
                      <Image className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Files Found</h3>
                      <p className="text-gray-500 mb-4">
                        {mediaFiles?.length === 0
                          ? "No media files have been uploaded for this property yet."
                          : "No files match your search."
                        }
                      </p>
                      <Button
                        onClick={() => {
                          const property = propertyFolders?.find(f => f.id === selectedPropertyId);
                          if (property) navigate(`/upload/${property.token}`);
                        }}
                        variant="outline"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Files
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredFiles.map((file) => (
                        <Card
                          key={file.id}
                          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                        >
                          <CardContent className="p-4">
                            <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                              {file.fileType === 'photo' ? (
                                <img
                                  src={file.fileUrl}
                                  alt={file.fileName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (nextElement) {
                                      nextElement.style.display = 'flex';
                                    }
                                  }}
                                />
                              ) : (
                                <Video className="w-12 h-12 text-purple-500" />
                              )}
                              <div className="w-full h-full items-center justify-center hidden">
                                {getFileIcon(file.fileType)}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h3 className="font-medium text-sm truncate">{file.stepTitle}</h3>
                              <p className="text-xs text-gray-500 truncate">{file.fileName}</p>
                              <div className="flex items-center justify-between">
                                <Badge className={getFileTypeColor(file.fileType)} variant="secondary">
                                  {file.fileType}
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  {formatFileSize(file.fileSize)}
                                </span>
                              </div>
                              <div className="flex gap-1 mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 text-xs"
                                  onClick={() => window.open(file.fileUrl, '_blank')}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 text-xs"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = file.fileUrl;
                                    link.download = file.fileName;
                                    link.click();
                                  }}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs px-2"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-red-600" />
                                        Delete Media File
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{file.fileName}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteMediaMutation.mutate(file.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                        disabled={deleteMediaMutation.isPending}
                                      >
                                        {deleteMediaMutation.isPending ? 'Deleting...' : 'Delete File'}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(file.timestamp)}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}