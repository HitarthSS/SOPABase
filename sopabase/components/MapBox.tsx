import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// Replace with your Mapbox access token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const MapboxGlobe = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      projection: 'globe',
      zoom: 1.5,
      center: [0, 20],
      pitch: 45,
      attributionControl: false // Hide attribution to save space
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add attribution in a better position
    map.current.addControl(new mapboxgl.AttributionControl({
      compact: true
    }), 'bottom-right');

    // Add atmosphere and fog effects
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6
      });
    });

    // Handle container resize
    const resizeMap = () => {
      if (map.current) {
        map.current.resize();
      }
    };

    window.addEventListener('resize', resizeMap);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', resizeMap);
      map.current?.remove();
      map.current = null;
    };
  }, []);

  const searchLocation = async () => {
    if (!searchQuery.trim() || !map.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_TOKEN}`
      );

      if (!response.ok) throw new Error('Location search failed');

      const data = await response.json();
      
      if (data.features.length === 0) {
        setError('Location not found');
        return;
      }

      const [lng, lat] = data.features[0].center;
      
      map.current.flyTo({
        center: [lng, lat],
        zoom: 8,
        duration: 2000,
        essential: true
      });

      // Add marker at location
      new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map.current);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchLocation();
  };

  return (
    <Card className="w-full h-[700px] overflow-hidden">
      <CardContent className="p-0 relative h-full">
        {/* Search Container */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <Card className="w-full max-w-md mx-auto bg-white/90 backdrop-blur">
            <CardContent className="p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter location..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-6"
                  asChild
                >
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </motion.button>
                </Button>
              </form>
              {error && (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-red-500 text-sm mt-2"
                >
                  {error}
                </motion.p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Map Container */}
        <div 
          ref={mapContainer} 
          className="w-full h-full"
          style={{ background: 'rgb(11, 11, 25)' }}
        />
      </CardContent>
    </Card>
  );
};

export default MapboxGlobe;