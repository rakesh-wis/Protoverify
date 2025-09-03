export interface Location {
	address: string;
	latitude: number;
	longitude: number;
	geoFence: GeoFence;
}

export interface GeoFence {
	center: google.maps.LatLngLiteral;
	radius: number;
	bounds: {
		east: number;
		north: number;
		south: number;
		west: number;
	};
}
