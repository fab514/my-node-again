import axios from 'axios';
import { $ } from './bling';

const mapOptions = {
  center: { lat: 43.2, lng: -79.8 },
  zoom: 10
};

function loadPlaces(map, lat = 43.2, lng = -79.8) {
  axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
    .then(res => {
      const places = res.data;
      if (!places.length) {
        alert('no places found!');
        return;
      }
      // create a bounds
      const bounds = new google.maps.LatLngBounds();
      const infoWindow = new google.maps.InfoWindow();

      const markers = places.map(place => {
        const [placeLng, placeLat] = place.location.coordinates;
        const position = { lat: placeLat, lng: placeLng };
        bounds.extend(position); // bounds makes a square around the markers and adjust zoom based on the markers
        const marker = new google.maps.Marker({ map, position });
        marker.place = place;
        return marker;
      });
      // addListener is google version of addEventListener
      // when someone clicks on a marker, show the details of that place
      markers.forEach(marker => marker.addListener('click', function() {
        console.log(this.place); // the html for the marker popup
        const html = `
          <div class="popup">
            <a href="/store/${this.place.slug}">
              <img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}" />
              <p>${this.place.name} - ${this.place.location.address}</p>
            </a>
          </div>
        `;
        infoWindow.setContent(html);
        infoWindow.open(map, this); // this attaches to this map
      }));

      // then zoom the map to fit all the markers perfectly
      map.setCenter(bounds.getCenter()); // using getCenter will center the markers
      map.fitBounds(bounds);
    });

}

function makeMap(mapDiv) {
  if (!mapDiv) return;
  // make our map
  const map = new google.maps.Map(mapDiv, mapOptions);
  loadPlaces(map);

  const input = $('[name="geolocate"]');
  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng()); // locate the search from any part of the map
  });
}

export default makeMap;