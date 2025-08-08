import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { LatLngExpression, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Phone, MessageCircle } from 'lucide-react';
import type { ServiceProvider } from '@shared/schema';

// Fix for default Leaflet icons
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons for different marker types
const createCustomIcon = (color: string) => new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
    </svg>
  `)}`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const userIcon = createCustomIcon('#3b82f6');
const providerIcon = createCustomIcon('#10b981');

interface Provider extends ServiceProvider {
  latitude?: number;
  longitude?: number;
  distance?: number;
}

interface LeafletMapProps {
  center: LatLngExpression;
  zoom?: number;
  providers?: Provider[];
  userLocation?: { lat: number; lng: number };
  searchRadius?: number;
  onProviderClick?: (provider: Provider) => void;
  className?: string;
  height?: string;
}

// Component to handle map updates
function MapUpdater({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
}

export function LeafletMap({
  center,
  zoom = 13,
  providers = [],
  userLocation,
  searchRadius,
  onProviderClick,
  className = "",
  height = "400px"
}: LeafletMapProps) {
  const [mapReady, setMapReady] = useState(false);

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        whenCreated={() => setMapReady(true)}
      >
        <MapUpdater center={center} zoom={zoom} />
        
        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>
                <div className="text-center">
                  <MapPin className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                  <p className="font-medium">Tu ubicación</p>
                </div>
              </Popup>
            </Marker>
            
            {/* Search radius circle */}
            {searchRadius && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={searchRadius * 1000} // Convert km to meters
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.1,
                  weight: 2,
                }}
              />
            )}
          </>
        )}
        
        {/* Provider markers */}
        {providers.map((provider) => {
          if (!provider.latitude || !provider.longitude) return null;
          
          return (
            <Marker
              key={provider.id}
              position={[provider.latitude, provider.longitude]}
              icon={providerIcon}
              eventHandlers={{
                click: () => onProviderClick?.(provider),
              }}
            >
              <Popup>
                <Card className="w-64 border-0 shadow-none">
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-sm">{provider.businessName}</h3>
                          <p className="text-xs text-muted-foreground">{provider.businessDescription}</p>
                        </div>
                      </div>
                      
                      {provider.averageRating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{provider.averageRating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({provider.totalReviews} reseñas)
                          </span>
                        </div>
                      )}
                      
                      {provider.distance && (
                        <Badge variant="secondary" className="text-xs">
                          {provider.distance.toFixed(1)} km
                        </Badge>
                      )}
                      
                      <div className="flex gap-1 pt-1">
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          <Phone className="w-3 h-3 mr-1" />
                          Llamar
                        </Button>
                        <Button size="sm" className="h-7 text-xs">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Chat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}