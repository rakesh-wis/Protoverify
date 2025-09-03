import {
	Component,
	ElementRef,
	Input,
	NgZone,
	OnInit,
	Output,
	EventEmitter,
	ViewChild,
	AfterViewInit,
	OnChanges,
	SimpleChanges,
} from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { Location } from 'src/app/models/location.model';

@Component({
	selector: 'app-google-map',
	templateUrl: './google-map.component.html',
	styleUrls: ['./google-map.component.scss'],
})
export class GoogleMapComponent implements OnInit, AfterViewInit, OnChanges {
	@Input() location: string;
	@Input() markerDraggable: boolean = true;
	@Input() zoom = 15;
	@Input() locationData: any;
	@Input() isForView: boolean = false;
	address: string = '';
	alpha: number = 1;
	markers: Location = {
		address: '',
		latitude: 0,
		longitude: 0,
		geoFence: {
			center: { lat: 0, lng: 0 },
			radius: 0,
			bounds: {
				east: 0,
				north: 0,
				south: 0,
				west: 0,
			},
		},
	}; // Initialize with default values
	private geoCoder: google.maps.Geocoder;
	@ViewChild('locationSearch', { read: ElementRef }) public searchElementRef: ElementRef;
	@ViewChild(GoogleMap) map: GoogleMap;
	@Output() emitLocation: EventEmitter<any> = new EventEmitter();
	drawingOptions: any = null;
	private drawingManager: google.maps.drawing.DrawingManager;

	constructor(private ngZone: NgZone) {}

	ngOnInit(): void {
		this.initializeMarkers();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['locationData'] && this.locationData) {
			this.markers = this.locationData || this.markers; // Update only if locationData is valid
			this.zoom = 15;
			console.log(this.markers);
		}
	}
	ngAfterViewInit(): void {
		this.loadPlace();
	}

	initializeMarkers(): void {
		// Initialize markers if locationData is not provided
		if (!this.locationData?.latitude) {
			this.setCurrentLocation();
		}
	}

	loadPlace(): void {
		this.geoCoder = new google.maps.Geocoder();
		this.drawingOptions = {
			drawingMode: google.maps.drawing.OverlayType.CIRCLE,
			drawingControl: !this.isForView,
			drawingControlOptions: {
				position: google.maps.ControlPosition.TOP_CENTER,
				drawingModes: [google.maps.drawing.OverlayType.CIRCLE],
			},
			circleOptions: {
				fillColor: '#1A2C53',
				fillOpacity: 0.5,
				strokeWeight: 2,
				draggable: !this.isForView,
				editable: !this.isForView,
				zIndex: 1,
				...(this.markers?.geoFence?.center && {
					center: this.markers.geoFence.center,
					radius: this.markers.geoFence.radius,
				}),
			},
		};
		if (!this.isForView) {
			const autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
			autocomplete.addListener('place_changed', () => {
				this.ngZone.run(() => {
					const place: google.maps.places.PlaceResult = autocomplete.getPlace();
					if (place.geometry) {
						const lat = place.geometry.location.lat();
						const lng = place.geometry.location.lng();

						// Check if lat and lng are valid numbers
						if (typeof lat === 'number' && typeof lng === 'number') {
							this.markers.latitude = lat;
							this.markers.longitude = lng;
							this.zoom = 15;
							this.setLocation();
						} else {
							console.error('Invalid latitude or longitude from place result');
						}
					}
				});
			});
		}
	}
	initializeDrawingManager(): void {
		this.drawingManager = new google.maps.drawing.DrawingManager(this.drawingOptions);
		this.drawingManager.setMap(this.map.googleMap!);
		// Handle circle drawing event
		google.maps.event.addListener(this.drawingManager, 'circlecomplete', (circle) => {
			const center = circle.getCenter();
			const radius = circle.getRadius();
			console.log(`Circle drawn at center: ${center}, radius: ${radius}`);
			this.markers.geoFence = {
				radius: circle.getRadius(),
				center: circle.getCenter().toJSON(),
				bounds: circle.getBounds().toJSON(),
			};
			this.drawingOptions.drawingControl = false;
			this.drawingOptions.drawingMode = null;
			this.drawingManager.setOptions(this.drawingOptions);
			// You can emit these values or handle the drawn circle data as needed
			this.setLocation();
		});
	}
	radiusDragEnd(event) {
		// console.log('radiusDragEnd event', event);
		this.markers.geoFence.center = event.coords;
	}
	onRadiusChange(event) {
		if (this.markers.geoFence) {
			// console.log('onRadiusChange event', event);
			this.markers.geoFence.radius = event;
			this.setLocation();
		}
	}

	markerDragEnd(event: google.maps.MapMouseEvent) {
		if (event.latLng) {
			this.markers.latitude = event.latLng.lat();
			this.markers.longitude = event.latLng.lng();
			this.getAddress(this.markers.latitude, this.markers.longitude);
		}
	}
	mapClicked($event) {
		this.markers.latitude = $event.coords.lat;
		this.markers.longitude = $event.coords.lng;
		this.getAddress(this.markers.latitude, this.markers.longitude);
	}
	getAddress(latitude: number, longitude: number): void {
		this.geoCoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
			if (status === 'OK' && results[0]) {
				this.address = results[0].formatted_address;
				this.setLocation();
			}
		});
	}

	setLocation(): void {
		this.emitLocation.emit({
			address: this.address,
			...this.markers,
		});
	}

	onMapReady(map: google.maps.Map) {
		if (!this.markers.latitude) {
			// console.log('setting current location')
			this.setCurrentLocation();
			return;
		}
		if (this.markers.geoFence) {
			this.drawingOptions.drawingMode = null;
			this.drawingOptions.drawingControl = false;
		}
		this.initializeDrawingManager();
	}

	setCurrentLocation(): void {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					this.markers.latitude = position.coords.latitude;
					this.markers.longitude = position.coords.longitude;
					this.zoom = 15;
					this.setLocation();
				},
				(error) => {
					console.error('Geolocation error:', error);
				}
			);
		} else {
			console.error('Geolocation is not supported by this browser.');
		}
	}
}
