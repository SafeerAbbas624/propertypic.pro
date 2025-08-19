export interface InspectionStep {
  id: string;
  title: string;
  description: string;
  exampleImageUrl: string;
  category: 'exterior' | 'interior' | 'bedrooms' | 'bathrooms' | 'utility' | 'special' | 'walkaround';
  isCompleted?: boolean;
  mediaType?: 'photo' | 'video'; // Add media type specification
}

export interface PropertyFeatures {
  hasPool?: boolean;
  hasBasement?: boolean;
  hasGarage?: boolean;
  specialFeatures?: string[];
}

// Function to get inspection steps for different property types
export const getInspectionSteps = (
  propertyType: string = 'SFR',
  bedrooms: number = 3,
  bathrooms: number = 2,
  features: PropertyFeatures = {}
): InspectionStep[] => {
  // Exterior steps
  const exteriorSteps: InspectionStep[] = [
    {
      id: 'front-exterior',
      title: 'Front of Property',
      description: 'Take a photo from curb to front door showing the entire front facade, entrance, and landscaping.',
      exampleImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'exterior'
    },
    {
      id: 'left-side-exterior',
      title: 'Left Side Exterior',
      description: 'Capture the left side of the property showing the full side wall and any features.',
      exampleImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'exterior'
    },
    {
      id: 'right-side-exterior',
      title: 'Right Side Exterior',
      description: 'Capture the right side of the property showing the full side wall and any features.',
      exampleImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'exterior'
    },
    {
      id: 'rear-exterior',
      title: 'Rear of Property',
      description: 'Take a photo of the back of the property showing the rear facade and backyard.',
      exampleImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'exterior'
    },
    {
      id: 'roof-view',
      title: 'Roof View',
      description: 'Photograph the roof from ground level or ladder if safely accessible and visible.',
      exampleImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'exterior'
    },
    {
      id: 'street-view-left',
      title: 'Street View - Facing Left',
      description: 'Take a photo facing left from the property to show the street and neighborhood context.',
      exampleImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'exterior'
    },
    {
      id: 'street-view-right',
      title: 'Street View - Facing Right',
      description: 'Take a photo facing right from the property to show the street and neighborhood context.',
      exampleImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'exterior'
    },
    {
      id: 'driveway-parking',
      title: 'Driveway / Parking Area',
      description: 'Capture the driveway and parking areas showing condition and capacity.',
      exampleImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'exterior'
    },
    {
      id: 'front-yard-landscaping',
      title: 'Front Yard Landscaping',
      description: 'Document the front yard landscaping, lawn, and garden areas.',
      exampleImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'exterior'
    },
    {
      id: 'back-yard-landscaping',
      title: 'Back Yard Landscaping',
      description: 'Document the back yard landscaping, lawn, and garden areas.',
      exampleImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'exterior'
    }
  ];

  // Interior - Main Living Areas
  const interiorSteps: InspectionStep[] = [
    {
      id: 'living-room-wide',
      title: 'Living Room - Wide Shot',
      description: 'Take a wide shot of the living room showing the entire space including seating areas and windows.',
      exampleImageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'interior'
    },
    {
      id: 'dining-area',
      title: 'Dining Area',
      description: 'Capture the dining area showing the space and any built-in features.',
      exampleImageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'interior'
    },
    {
      id: 'kitchen-wide',
      title: 'Kitchen - Wide Shot',
      description: 'Take a wide shot of the kitchen showing the overall layout, cabinets, and countertops.',
      exampleImageUrl: 'https://images.unsplash.com/photo-1556911220-bec6e7353275?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'interior'
    },
    {
      id: 'kitchen-appliances',
      title: 'Kitchen - Appliances',
      description: 'Document kitchen appliances: refrigerator, stove, dishwasher, and their condition.',
      exampleImageUrl: 'https://images.unsplash.com/photo-1556911220-bec6e7353275?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'interior'
    },
    {
      id: 'kitchen-sink-counters',
      title: 'Kitchen - Sink and Counters',
      description: 'Capture the kitchen sink area and countertops showing condition and materials.',
      exampleImageUrl: 'https://images.unsplash.com/photo-1556911220-bec6e7353275?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'interior'
    }
  ];

  // Generate dynamic bedroom steps
  const bedroomSteps: InspectionStep[] = [];
  for (let i = 1; i <= bedrooms; i++) {
    bedroomSteps.push(
      {
        id: `bedroom-${i}-wide`,
        title: `Bedroom ${i} - Wide Shot`,
        description: `Take a wide shot of bedroom ${i} showing the overall layout, windows, and space.`,
        exampleImageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        category: 'bedrooms'
      },
      {
        id: `bedroom-${i}-closet`,
        title: `Bedroom ${i} - Closet`,
        description: `Capture bedroom ${i} closet if it's walk-in or large, showing storage space and condition.`,
        exampleImageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        category: 'bedrooms'
      }
    );
  }

  // Generate dynamic bathroom steps
  const bathroomSteps: InspectionStep[] = [];
  for (let i = 1; i <= bathrooms; i++) {
    bathroomSteps.push(
      {
        id: `bathroom-${i}-wide`,
        title: `Bathroom ${i} - Wide Shot`,
        description: `Take a wide shot of bathroom ${i} showing all fixtures and overall layout.`,
        exampleImageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        category: 'bathrooms'
      },
      {
        id: `bathroom-${i}-sink-vanity`,
        title: `Bathroom ${i} - Sink & Vanity`,
        description: `Capture bathroom ${i} sink and vanity area showing condition and storage.`,
        exampleImageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        category: 'bathrooms'
      },
      {
        id: `bathroom-${i}-shower-tub`,
        title: `Bathroom ${i} - Shower/Tub`,
        description: `Document bathroom ${i} shower or tub area showing fixtures and condition.`,
        exampleImageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        category: 'bathrooms'
      },
      {
        id: `bathroom-${i}-toilet`,
        title: `Bathroom ${i} - Toilet`,
        description: `Capture bathroom ${i} toilet area showing condition and surrounding space.`,
        exampleImageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        category: 'bathrooms'
      }
    );
  }

  // Utility & Condition steps
  const utilitySteps: InspectionStep[] = [
    {
      id: 'laundry-area',
      title: 'Laundry Area / Washer-Dryer',
      description: 'Document the laundry area and washer/dryer connections or units.',
      exampleImageUrl: 'https://images.unsplash.com/photo-1595514535415-dae8970c1333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'utility'
    },
    {
      id: 'hvac-water-heater',
      title: 'HVAC Unit / Water Heater',
      description: 'Take photos of HVAC unit and water heater showing model numbers and condition.',
      exampleImageUrl: 'https://images.unsplash.com/photo-1595514535415-dae8970c1333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'utility'
    },
    {
      id: 'electrical-panel',
      title: 'Electrical Panel',
      description: 'Photograph the main electrical panel/breaker box clearly, showing all breakers and panel condition.',
      exampleImageUrl: 'https://images.unsplash.com/photo-1607977027972-e5681b8d2801?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'utility'
    },
    {
      id: 'visible-damage',
      title: 'Any Visible Damage or Repairs Needed',
      description: 'Document any visible damage, repairs needed, or areas of concern throughout the property with close-ups.',
      exampleImageUrl: 'https://images.unsplash.com/photo-1508230465-73294a882fb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'utility'
    }
  ];

  // Special features steps based on property features
  const specialSteps: InspectionStep[] = [];

  // Add garage if specified
  if (features.hasGarage) {
    specialSteps.push({
      id: 'garage-storage',
      title: 'Garage / Storage Spaces',
      description: 'Document garage and storage areas showing capacity, condition, and any built-in features.',
      exampleImageUrl: 'https://images.unsplash.com/photo-1595514535415-dae8970c1333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'special'
    });
  }

  // Add basement if specified
  if (features.hasBasement) {
    specialSteps.push({
      id: 'basement-crawlspace',
      title: 'Basement / Crawl Space',
      description: 'Capture basement or crawl space areas showing structural condition and accessibility.',
      exampleImageUrl: 'https://images.unsplash.com/photo-1595514535415-dae8970c1333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'special'
    });
  }

  // Add pool if specified
  if (features.hasPool) {
    specialSteps.push({
      id: 'pool-area',
      title: 'Pool Area',
      description: 'Document pool area including pool condition, decking, and safety features.',
      exampleImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'special'
    });
  }

  // Add special features from notes
  if (features.specialFeatures && features.specialFeatures.length > 0) {
    features.specialFeatures.forEach((feature, index) => {
      specialSteps.push({
        id: `special-feature-${index + 1}`,
        title: `Special Feature - ${feature}`,
        description: `Document the ${feature} showing its condition and features.`,
        exampleImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        category: 'special'
      });
    });
  }

  // Walkaround video step
  const walkaroundStep: InspectionStep = {
    id: 'property-walkaround',
    title: 'Property Walkaround Video',
    description: 'Record a 2-minute walkthrough video of the entire property, starting from the front entrance and moving through all main areas. Keep the video smooth and steady.',
    exampleImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
    category: 'walkaround',
    mediaType: 'video'
  };

  // Combine all steps based on property configuration
  const allSteps = [
    ...exteriorSteps,
    ...interiorSteps,
    ...bedroomSteps,
    ...bathroomSteps,
    ...utilitySteps,
    ...specialSteps,
    walkaroundStep
  ];

  // Add property-type specific steps
  if (propertyType?.toLowerCase() === 'duplex') {
    // For duplex, add unit-specific steps
    allSteps.splice(2, 0,
      {
        id: 'unit-1-entrance',
        title: 'Unit 1 - Entrance',
        description: 'Take a photo of the entrance to Unit 1, showing the door and any unit-specific features.',
        exampleImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        category: 'exterior'
      },
      {
        id: 'unit-2-entrance',
        title: 'Unit 2 - Entrance',
        description: 'Take a photo of the entrance to Unit 2, showing the door and any unit-specific features.',
        exampleImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        category: 'exterior'
      }
    );
  }

  return allSteps;
};
