import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Copy, 
  ExternalLink, 
  Home, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  CheckCircle,
  Share2
} from "lucide-react";
import { PropertyLead } from "@shared/schema";

const PropertyCreated = () => {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Fetch property lead data
  const { data: propertyLead, isLoading, error } = useQuery<PropertyLead>({
    queryKey: [`/api/property-leads/${token}`],
    retry: false
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Property not found or invalid token.",
        variant: "destructive",
      });
      navigate("/home");
    }
  }, [error, navigate, toast]);

  const inspectionUrl = `${window.location.origin}/upload/${token}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inspectionUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "The inspection link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please manually copy the link below.",
        variant: "destructive",
      });
    }
  };

  const handleShareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Property Inspection Link',
        text: `Please complete the property inspection for ${propertyLead?.address}`,
        url: inspectionUrl,
      });
    } else {
      handleCopyLink();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-3/4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!propertyLead) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/home")}
            className="mb-4 p-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Property Inspection Created!</h1>
          </div>
          <p className="text-gray-600">
            Your property inspection has been set up successfully. Share the link below with your photographer or inspector.
          </p>
        </div>

        {/* Property Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{propertyLead.address}</h3>
              <p className="text-gray-600">
                {propertyLead.city}, {propertyLead.state} {propertyLead.zipCode}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Bed className="w-3 h-3" />
                  {propertyLead.bedrooms} Bed
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Bath className="w-3 h-3" />
                  {propertyLead.bathrooms} Bath
                </Badge>
              </div>
              {propertyLead.squareFeet && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Square className="w-3 h-3" />
                    {propertyLead.squareFeet.toLocaleString()} sq ft
                  </Badge>
                </div>
              )}
              <Badge variant="outline">{propertyLead.propertyType}</Badge>
            </div>

            {/* Special Features */}
            {(propertyLead.hasPool || propertyLead.hasBasement || propertyLead.hasGarage) && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Special Features:</h4>
                <div className="flex flex-wrap gap-2">
                  {propertyLead.hasPool && <Badge variant="outline">Pool</Badge>}
                  {propertyLead.hasBasement && <Badge variant="outline">Basement</Badge>}
                  {propertyLead.hasGarage && <Badge variant="outline">Garage</Badge>}
                </div>
              </div>
            )}

            {propertyLead.notes && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1">Notes:</h4>
                <p className="text-sm text-gray-600">{propertyLead.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inspection Link Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-green-600" />
              Inspection Link
            </CardTitle>
            <p className="text-sm text-gray-600">
              Share this link with your photographer or inspector to start the property documentation process.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm font-mono break-all text-gray-800">
                {inspectionUrl}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCopyLink}
                className="flex-1"
                variant={copied ? "default" : "outline"}
              >
                <Copy className="w-4 h-4 mr-2" />
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Button
                onClick={handleShareLink}
                variant="outline"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate(`/upload/${token}`)}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Preview Inspection Page
          </Button>
          
          <Button
            onClick={() => navigate("/home")}
            variant="outline"
            className="w-full h-12"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCreated;
