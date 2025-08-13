import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Camera, Home as HomeIcon, Bed, Bath, Square, MapPin, Plus, FolderOpen, Settings, HardDrive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GoogleDriveStatus } from "@/components/GoogleDriveStatus";
import { AddressSearch } from "@/components/AddressSearch";

const Home = () => {
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState<any>(null);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Property form state
  const [propertyForm, setPropertyForm] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    propertyType: "SFR", // Single Family Residence
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1500,
    notes: "",
    hasPool: false,
    hasBasement: false,
    hasGarage: false
  });

  const handleCreateNewToken = () => {
    setShowPropertyForm(true);
  };

  const handleCreatePropertyWithDetails = async () => {
    if (!propertyForm.address.trim() || !propertyForm.city.trim() || !propertyForm.state.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in address, city, and state",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Prepare the data to match the expected schema
      const propertyData = {
        name: `${propertyForm.address}, ${propertyForm.city}`,
        email: null,
        phone: null,
        address: propertyForm.address,
        city: propertyForm.city,
        state: propertyForm.state,
        zipCode: propertyForm.zipCode,
        bedrooms: propertyForm.bedrooms,
        bathrooms: propertyForm.bathrooms,
        squareFeet: propertyForm.squareFeet,
        propertyType: propertyForm.propertyType,
        hasPool: propertyForm.hasPool,
        hasBasement: propertyForm.hasBasement,
        hasGarage: propertyForm.hasGarage,
        notes: propertyForm.notes
      };

      console.log("Sending property data:", propertyData);
      
      const response = await apiRequest("POST", "/api/property-leads", propertyData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create property");
      }
      
      const data = await response.json();
      setPropertyDetails(data);
      setShowPropertyForm(false);
      toast({
        title: "Property Ready for Inspection",
        description: `New inspection token created: ${data.token}`,
      });

      // Navigate to the upload page with the new token
      navigate(`/upload/${data.token}`);
    } catch (error) {
      console.error("Error creating property:", error);
      toast({
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to create property inspection",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePropertySelect = (property: any) => {
    setSelectedProperty(property);
  };

  const handleAccessProperty = () => {
    if (!selectedProperty) {
      toast({
        title: "Error",
        description: "Please select a property",
        variant: "destructive",
      });
      return;
    }

    navigate(`/upload/${selectedProperty.token}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">MediaVault</h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">Property Media Collection Made Simple</p>
          <p className="text-gray-500">Create property inspections, collect photos & videos, organize everything automatically</p>
        </div>

        {/* Google Drive Status - Optional */}
        <div className="mb-8">
          <GoogleDriveStatus />
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Actions */}
          <Card className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Plus className="w-6 h-6 text-blue-600" />
                Quick Start
              </CardTitle>
              <p className="text-gray-600">Get started with property media collection</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleCreateNewToken}
                disabled={loading}
                className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-3 h-6 w-6" />
                Create New Property Inspection
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-3 text-gray-500">or</span>
                </div>
              </div>

              <div className="space-y-3">
                <AddressSearch
                  onPropertySelect={handlePropertySelect}
                  placeholder="Search existing property by address..."
                />
                <Button
                  onClick={handleAccessProperty}
                  variant="outline"
                  className="w-full h-12"
                  disabled={!selectedProperty}
                >
                  {selectedProperty ? `Continue Inspection - ${selectedProperty.name}` : 'Continue Existing Inspection'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Browse & Manage */}
          <Card className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <FolderOpen className="w-6 h-6 text-green-600" />
                Browse & Manage
              </CardTitle>
              <p className="text-gray-600">View and organize your property media</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => navigate("/browse")}
                variant="outline"
                className="w-full h-14 text-lg font-semibold border-green-200 hover:bg-green-50"
              >
                <FolderOpen className="w-6 h-6 mr-3 text-green-600" />
                Browse All Properties
              </Button>

              <Button
                onClick={() => navigate("/admin")}
                variant="outline"
                className="w-full h-12 border-gray-200 hover:bg-gray-50"
              >
                <Settings className="w-5 h-5 mr-2" />
                Admin Setup
              </Button>
            </CardContent>
          </Card>
        </div>

        {propertyDetails ? (
          <Card className="mb-6 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary/80 to-primary w-full relative">
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <HomeIcon size={48} />
              </div>
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{propertyDetails.name}</CardTitle>
                <Badge variant="outline" className="bg-primary/10">
                  {propertyDetails.propertyType}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span>
                    {propertyDetails.address}, {propertyDetails.city}, {propertyDetails.state} {propertyDetails.zipCode}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="flex items-center justify-center bg-neutral-50 p-2 rounded-md">
                    <Bed className="mr-1 h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{propertyDetails.bedrooms} Beds</span>
                  </div>
                  <div className="flex items-center justify-center bg-neutral-50 p-2 rounded-md">
                    <Bath className="mr-1 h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{propertyDetails.bathrooms} Baths</span>
                  </div>
                  <div className="flex items-center justify-center bg-neutral-50 p-2 rounded-md">
                    <Square className="mr-1 h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{propertyDetails.squareFeet} ft²</span>
                  </div>
                </div>
                
                <div className="space-y-3 mt-4">
                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/upload/${propertyDetails.token}`)}
                  >
                    Start Inspection
                  </Button>
                  
                  <div className="bg-neutral-100 p-3 rounded-md">
                    <Label className="text-sm font-medium text-neutral-700 mb-2 block">
                      Share this link with clients:
                    </Label>
                    <div className="flex gap-2">
                      <Input 
                        value={`${window.location.origin}/upload/${propertyDetails.token}`}
                        readOnly 
                        className="text-sm"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/upload/${propertyDetails.token}`);
                          toast({
                            title: "Link Copied!",
                            description: "Inspection link copied to clipboard",
                          });
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      <strong>Ready to share!</strong> Photos will upload directly to your Google Drive
                    </p>
                  </div>
                  
                  {propertyDetails.googleDriveShareLink && (
                    <div className="bg-green-50 p-3 rounded-md border border-green-200">
                      <Label className="text-sm font-medium text-green-800 mb-2 block">
                        Google Drive Folder:
                      </Label>
                      <div className="flex gap-2">
                        <Input 
                          value={propertyDetails.googleDriveShareLink}
                          readOnly 
                          className="text-sm"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(propertyDetails.googleDriveShareLink);
                            toast({
                              title: "Drive Link Copied!",
                              description: "Google Drive folder link copied to clipboard",
                            });
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        Photos will be automatically organized in this folder
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : showPropertyForm ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
              <p className="text-sm text-muted-foreground">
                Provide property details to customize the inspection steps
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="address">Property Address *</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    value={propertyForm.address}
                    onChange={(e) => setPropertyForm({...propertyForm, address: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Miami"
                      value={propertyForm.city}
                      onChange={(e) => setPropertyForm({...propertyForm, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="FL"
                      value={propertyForm.state}
                      onChange={(e) => setPropertyForm({...propertyForm, state: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    placeholder="33101"
                    value={propertyForm.zipCode}
                    onChange={(e) => setPropertyForm({...propertyForm, zipCode: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select 
                    value={propertyForm.propertyType} 
                    onValueChange={(value) => setPropertyForm({...propertyForm, propertyType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SFR">Single Family Home</SelectItem>
                      <SelectItem value="duplex">Duplex</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="multi-family">Multi-Family</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Select 
                      value={propertyForm.bedrooms.toString()} 
                      onValueChange={(value) => setPropertyForm({...propertyForm, bedrooms: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Select 
                      value={propertyForm.bathrooms.toString()} 
                      onValueChange={(value) => setPropertyForm({...propertyForm, bathrooms: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="squareFeet">Sq Ft</Label>
                    <Input
                      id="squareFeet"
                      type="number"
                      value={propertyForm.squareFeet}
                      onChange={(e) => setPropertyForm({...propertyForm, squareFeet: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div>
                  <Label>Additional Features</Label>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="hasPool"
                        checked={propertyForm.hasPool}
                        onChange={(e) => setPropertyForm({...propertyForm, hasPool: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="hasPool" className="text-sm font-normal">Pool</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="hasBasement"
                        checked={propertyForm.hasBasement}
                        onChange={(e) => setPropertyForm({...propertyForm, hasBasement: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="hasBasement" className="text-sm font-normal">Basement</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="hasGarage"
                        checked={propertyForm.hasGarage}
                        onChange={(e) => setPropertyForm({...propertyForm, hasGarage: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="hasGarage" className="text-sm font-normal">Garage</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Special Features/Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Fireplace, deck, patio, etc."
                    value={propertyForm.notes}
                    onChange={(e) => setPropertyForm({...propertyForm, notes: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPropertyForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreatePropertyWithDetails}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Creating..." : "Create Inspection"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Photo Collection</h3>
            <p className="text-gray-600">Guided step-by-step process for property owners to upload photos and videos</p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HardDrive className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Storage</h3>
            <p className="text-gray-600">Files stored locally with optional Google Drive sync for backup and sharing</p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Organization</h3>
            <p className="text-gray-600">Automatic folder structure and file naming for easy browsing and management</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
