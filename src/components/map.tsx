import React, {
  useCallback,
  useRef,
  useState,
  useEffect,
  ReactNode
} from 'react'
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
  Circle,
  Polygon
} from '@react-google-maps/api'
import { CircleData, GeofenceData, PolygonData } from '../types/geofence'

const containerStyle = {
  width: '100%',
  height: '100%'
}

const defaultCenter = {
  lat: -33.9249,
  lng: 18.4241
}

const libraries = ['drawing'] as any

type MapProps = {
  // Base map props
  center?: google.maps.LatLngLiteral
  zoom?: number
  children?: ReactNode

  // For geofence editing
  geofences?: GeofenceData[]
  onGeofencesChange?: (geofences: GeofenceData[]) => void
  enableDrawing?: boolean

  // For tracking/location display
  currentLocation?: google.maps.LatLngLiteral

  // For trip/route display
  tripPath?: google.maps.LatLngLiteral[]
}

const GoogleMapComponent = React.forwardRef<any, MapProps>((props, ref) => {
  const {
    center = defaultCenter,
    zoom = 12,
    children,
    geofences = [],
    onGeofencesChange,
    enableDrawing = false,
    currentLocation,
    tripPath
  } = props
  // Expose shapesRef to parent components
  React.useImperativeHandle(ref, () => ({
    shapesRef
  }))
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
    libraries
  })

  const mapRef = useRef<google.maps.Map | null>(null)
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(
    null
  )

  if (drawingManagerRef.current) {
    drawingManagerRef.current.setMap(null)
    drawingManagerRef.current = null
  }

  // Keep track of native map shape objects by ID
  const shapesRef = useRef<
    Map<string, google.maps.Circle | google.maps.Polygon>
  >(new Map())

  // Helper to generate unique IDs (for demo only)
  const generateId = () => Math.random().toString(36).slice(2, 11)

  // Sync native shape edits back to geofences state
  const updateGeofenceData = useCallback((id: string) => {
    const shape = shapesRef.current.get(id)
    if (!shape) return

    if (shape instanceof google.maps.Circle) {
      const updated: CircleData = {
        id,
        type: 'circle',
        center: shape.getCenter()!.toJSON(),
        radius: shape.getRadius()
      }
      if (onGeofencesChange) {
        onGeofencesChange([...geofences, updated])
      }
      // updateGeofences((prev) => prev.map((g) => (g.id === id ? updated : g)));
    } else if (shape instanceof google.maps.Polygon) {
      const path = shape
        .getPath()
        .getArray()
        .map((latLng) => latLng.toJSON())
      const updated: PolygonData = {
        id,
        type: 'polygon',
        paths: path
      }
      if (onGeofencesChange) {
        onGeofencesChange([...geofences, updated])
      }
      // updateGeofences((prev) => prev.map((g) => (g.id === id ? updated : g)));
    }
  }, [])

  useEffect(() => {
    if (
      !mapRef.current ||
      !window.google ||
      !window.google.maps ||
      !window.google.maps.drawing
    ) {
      return
    }

    // Clean up any existing drawing manager to prevent duplicates
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setMap(null)
      drawingManagerRef.current = null
    }
    if (enableDrawing && mapRef.current) {
      onDrawingModeChanged(mapRef.current)
    }
  }, [enableDrawing])

  // Synchronize shapes on the map with geofences state
  useEffect(() => {
    if (!mapRef.current) return

    // Get all current shape IDs on the map
    const currentShapeIds = Array.from(shapesRef.current.keys())

    // Get all geofence IDs that should be on the map
    const geofenceIds = new Set(geofences.map((g) => g.id))

    // Find shapes that are on the map but not in geofences (should be removed)
    for (const id of currentShapeIds) {
      if (!geofenceIds.has(id)) {
        // This shape is no longer in geofences, remove it from the map
        const shape = shapesRef.current.get(id)
        if (shape) {
          // Explicitly remove from map
          shape.setMap(null)
          // Remove from our reference collection
          shapesRef.current.delete(id)
        }
      }
    }
  }, [geofences])

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const onDrawingModeChanged = useCallback(
    (map: google.maps.Map) => {
      // Create DrawingManager only if drawing is enabled
      drawingManagerRef.current = new window.google.maps.drawing.DrawingManager(
        {
          drawingMode: window.google.maps.drawing.OverlayType.CIRCLE,
          drawingControl: true,
          drawingControlOptions: {
            position: window.google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
              window.google.maps.drawing.OverlayType.CIRCLE,
              window.google.maps.drawing.OverlayType.POLYGON
            ]
          },
          circleOptions: {
            fillColor: '#2196F3',
            fillOpacity: 0.3,
            strokeWeight: 2,
            strokeColor: '#2196F3',
            clickable: true,
            editable: true,
            zIndex: 1
          },
          polygonOptions: {
            fillColor: '#4CAF50',
            fillOpacity: 0.3,
            strokeWeight: 2,
            strokeColor: '#4CAF50',
            clickable: true,
            editable: true,
            zIndex: 1
          }
        }
      )

      drawingManagerRef.current.setMap(map)

      // When user completes drawing a circle
      window.google.maps.event.addListener(
        drawingManagerRef.current,
        'circlecomplete',
        (circle: google.maps.Circle) => {
          const id = generateId()
          shapesRef.current.set(id, circle)

          // Listen for edits
          circle.addListener('radius_changed', () => updateGeofenceData(id))
          circle.addListener('center_changed', () => updateGeofenceData(id))

          // Add to state simplified data
          if (onGeofencesChange) {
            onGeofencesChange([
              ...geofences,
              {
                id,
                type: 'circle',
                center: circle.getCenter()!.toJSON(),
                radius: circle.getRadius()
              }
            ])
          }

          // drawingManagerRef.current?.setDrawingMode(null)
        }
      )

      // When user completes drawing a polygon
      window.google.maps.event.addListener(
        drawingManagerRef.current,
        'polygoncomplete',
        (polygon: google.maps.Polygon) => {
          const id = generateId()
          shapesRef.current.set(id, polygon)

          // Listen for edits to polygon path
          polygon.getPath().addListener('set_at', () => updateGeofenceData(id))
          polygon
            .getPath()
            .addListener('insert_at', () => updateGeofenceData(id))
          polygon
            .getPath()
            .addListener('remove_at', () => updateGeofenceData(id))

          // Add to state simplified data
          const path = polygon
            .getPath()
            .getArray()
            .map((latLng) => latLng.toJSON())

          if (onGeofencesChange) {
            onGeofencesChange([
              ...geofences,
              {
                id,
                type: 'polygon',
                paths: path
              }
            ])
          }

          // drawingManagerRef.current?.setDrawingMode(null)
        }
      )
    },
    [updateGeofenceData, geofences, onGeofencesChange]
  )

  const onUnmount = useCallback(() => {
    // Clean up
    shapesRef.current.forEach((shape) => shape.setMap(null))
    shapesRef.current.clear()

    if (drawingManagerRef.current) {
      drawingManagerRef.current.setMap(null)
      drawingManagerRef.current = null
    }
    mapRef.current = null
  }, [])

  // You could render a list of geofences with delete buttons:
  // Or build custom UI to select shapes on the map and delete them

  if (loadError) {
    return <div>Map cannot be loaded right now, sorry.</div>
  }

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {/* Render existing geofences */}
      {geofences.map((geofence) => {
        if (geofence.type === 'circle') {
          return (
            <Circle
              key={geofence.id}
              center={geofence.center}
              radius={geofence.radius}
              options={{
                fillColor: '#2196F3',
                fillOpacity: 0.3,
                strokeWeight: 2,
                strokeColor: '#2196F3',
                clickable: true,
                editable: enableDrawing,
                zIndex: 1
              }}
              onLoad={(circle) => {
                shapesRef.current.set(geofence.id, circle)
                // Listen for edits if drawing is enabled
                if (enableDrawing) {
                  circle.addListener('radius_changed', () =>
                    updateGeofenceData(geofence.id)
                  )
                  circle.addListener('center_changed', () =>
                    updateGeofenceData(geofence.id)
                  )
                }
              }}
            />
          )
        } else if (geofence.type === 'polygon') {
          return (
            <Polygon
              key={geofence.id}
              paths={geofence.paths}
              options={{
                fillColor: '#4CAF50',
                fillOpacity: 0.3,
                strokeWeight: 2,
                strokeColor: '#4CAF50',
                clickable: true,
                editable: enableDrawing,
                zIndex: 1
              }}
              onLoad={(polygon) => {
                shapesRef.current.set(geofence.id, polygon)
                // Listen for edits to polygon path if drawing is enabled
                if (enableDrawing) {
                  polygon
                    .getPath()
                    .addListener('set_at', () =>
                      updateGeofenceData(geofence.id)
                    )
                  polygon
                    .getPath()
                    .addListener('insert_at', () =>
                      updateGeofenceData(geofence.id)
                    )
                  polygon
                    .getPath()
                    .addListener('remove_at', () =>
                      updateGeofenceData(geofence.id)
                    )
                }
              }}
            />
          )
        }
        return null
      })}

      {/* Render current location marker if provided */}
      {currentLocation && (
        <Marker
          position={currentLocation}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          }}
        />
      )}

      {/* Render trip path if provided */}
      {tripPath && tripPath.length > 1 && (
        <Polyline
          path={tripPath}
          options={{
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 3
          }}
        />
      )}

      {/* Render any additional children components */}
      {children}
    </GoogleMap>
  )
})

// Create specific components that use the base map component

type GeofenceMapProps = {
  geofences?: GeofenceData[]
  onGeofencesChange?: (geofences: GeofenceData[]) => void
  enableDrawing?: boolean
}

export const GeofenceMap: React.FC<GeofenceMapProps> = ({
  geofences = [],
  onGeofencesChange,
  enableDrawing = false
}) => {
  console.log('geofences', geofences)
  // Reference to the map component to access shapesRef
  const mapComponentRef = useRef<any>(null)

  const deleteGeofence = (id: string) => {
    // First, find and remove the shape from the map directly
    if (mapComponentRef.current && mapComponentRef.current.shapesRef) {
      const shape = mapComponentRef.current.shapesRef.current.get(id)
      if (shape) {
        // Remove the shape from the map
        shape.setMap(null)
        mapComponentRef.current.shapesRef.current.delete(id)
      }
    }

    // Then update the state
    if (onGeofencesChange) {
      const updatedGeofences = geofences.filter(
        (geofence) => geofence.id !== id
      )
      onGeofencesChange(updatedGeofences)
    }
  }
  return (
    <>
      <GoogleMapComponent
        ref={mapComponentRef}
        geofences={enableDrawing ? [] : geofences}
        onGeofencesChange={onGeofencesChange}
        enableDrawing={enableDrawing}
      />
      {/* Simple UI for demo: List geofences with delete */}
      {enableDrawing ? (
        <div
          style={{
            position: 'absolute',
            top: 160,
            left: 25,
            background: 'white',
            padding: 10,
            maxHeight: 300,
            overflowY: 'auto'
          }}
        >
          <h3>Chosen Longitude and Latitude</h3>
          <br></br>
          <h3>
            <strong>Geofences</strong>{' '}
          </h3>

          {geofences.map((g) => (
            <div key={g.id} style={{ marginBottom: 5 }}>
              {g.type === 'circle' ? (
                <>
                  Circle at ({g.center.lat.toFixed(4)},{' '}
                  {g.center.lng.toFixed(4)}
                  ), radius: {Math.round(g.radius)} m
                </>
              ) : (
                <>Polygon with {g.paths.length} points</>
              )}
              <button
                onClick={() => deleteGeofence(g.id)}
                style={{ marginLeft: 10, cursor: 'pointer', color: 'red' }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </>
  )
}

type LiveViewMapProps = {
  currentLocation?: google.maps.LatLngLiteral
  children?: ReactNode
}

export const LiveViewMap: React.FC<LiveViewMapProps> = ({
  currentLocation,
  children
}) => {
  // Dummy current location if none provided
  const dummyLocation = currentLocation || {
    lat: -33.9249,
    lng: 18.4241
  }

  // Use state to track location for real-time updates
  const [location, setLocation] = useState(dummyLocation)

  // Update location when props change (simulating webhook updates)
  useEffect(() => {
    if (currentLocation) {
      setLocation(currentLocation)
    }
  }, [currentLocation])

  return (
    <GoogleMapComponent currentLocation={location} center={location} zoom={14}>
      {children}
    </GoogleMapComponent>
  )
}

type TripMapProps = {
  tripPath: google.maps.LatLngLiteral[]
  currentLocation?: google.maps.LatLngLiteral
}

export const TripMap: React.FC<TripMapProps> = ({
  tripPath,
  currentLocation
}) => {
  // Dummy trip path if none provided
  const dummyTripPath = tripPath || [
    { lat: -33.9249, lng: 18.4241 },
    { lat: -33.9279, lng: 18.4291 },
    { lat: -33.9299, lng: 18.4341 },
    { lat: -33.9329, lng: 18.4391 },
    { lat: -33.9359, lng: 18.4441 }
  ]

  // Use state to track path for real-time updates
  const [path, setPath] = useState(dummyTripPath)
  const [location, setLocation] = useState(currentLocation)

  // Update when props change (simulating real-time updates)
  useEffect(() => {
    if (tripPath) {
      setPath(tripPath)
    }
    if (currentLocation) {
      setLocation(currentLocation)
    }
  }, [tripPath, currentLocation])

  // Center on the middle point of the trip
  const centerPoint = path[Math.floor(path.length / 2)]

  return (
    <GoogleMapComponent
      tripPath={path}
      currentLocation={location}
      center={centerPoint}
      zoom={13}
    />
  )
}

// Default export for backward compatibility
export default React.memo(GeofenceMap)
