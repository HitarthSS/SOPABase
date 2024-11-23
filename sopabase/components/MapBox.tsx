"use client"

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Camera } from 'lucide-react';
import { motion } from "framer-motion";

// Replace with your Mapbox access token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const MapboxGlobe = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN as string;

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

  const sendBase64ToApi = async (base64: string) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ base64 }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setApiMessage(data.message);
    } catch (error) {
      console.error('Error sending base64 to API:', error);
      setApiMessage('Failed to process image');
    }
  };

  const captureScreenshot = () => {
    if (!map.current) return;

    map.current.once('render', () => {
      map.current?.getCanvas().toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result as string;
            setScreenshot(base64data);
            sendBase64ToApi(base64data.split(',')[1]); // Remove data URL prefix
          };
          reader.readAsDataURL(blob);
        }
      });
    });
    map.current.triggerRepaint();
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
                  className="flex-1 text-lg" // Increased text size
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
                      <Loader2 className="w-6 h-6 animate-spin" /> // Increased icon size
                    ) : (
                      <Search className="w-6 h-6" /> // Increased icon size
                    )}
                  </motion.button>
                </Button>
              </form>
              {error && (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-red-500 text-base mt-2" // Increased text size
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

        {/* Screenshot Button */}
        <Button
          onClick={captureScreenshot}
          className="absolute bottom-4 right-4 z-10 text-lg py-2 px-4" // Increased text size and padding
          asChild
        >
          <motion.button whileTap={{ scale: 0.95 }}>
            <Camera className="w-6 h-6 mr-2" /> {/* Increased icon size */}
            Generate Intelligence Report
          </motion.button>
        </Button>

        {/* Screenshot Preview */}
        {screenshot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-auto flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/3">
                <img src={screenshot} alt="Map Screenshot" className="w-full h-auto object-contain" />
              </div>
              <div className="lg:w-2/3 flex flex-col">
                <p className="text-2xl mb-4 font-semibold">Intelligence Report:</p>
                <textarea
                  value={apiMessage || 'Generating geospatial intelligence report...'}
                  readOnly
                  className="w-full flex-grow p-4 border rounded text-lg mb-4 min-h-[300px]"
                />
                <div className="flex justify-between mt-4">
                  <Button onClick={() => {
                    setScreenshot(null);
                    setApiMessage(null);
                  }} className="text-lg py-2 px-4">
                    Close
                  </Button>
                  <Button onClick={() => {
                    if (apiMessage) {
                      navigator.clipboard.writeText(apiMessage)
                        .then(() => console.log('copied'))
                        .catch(err => console.error('Failed to copy: ', err));
                    }
                  }} className="text-lg py-2 px-4">
                    Copy Intelligence Report
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapboxGlobe;

