//turn on server 'live-server'
//22635 cities in current.city.list.json
//

//function to print current local time every second
setInterval(() => {
  const today = new Date();
  const time = today.getHours(2) + ":" + today.getMinutes(2) + ":" + today.getSeconds(2) + "  your local time";
  document.getElementById('time-text').textContent = time;
}, 1000)


/** Initializes the map and the custom popup. */
let map, popup, Popup;



function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 45, lng: 0},
    zoom: 5
  });
}

//constructor function to construct city objects used for dropdown box
function City(name, country){
  this.name = name;
  this.country = country;
}

//http call to get array of cities locally
const cityArray = [];

let xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function(){
  if(this.readyState == 4 && this.status == 200){
    let response = JSON.parse(xhttp.responseText);
    for(i = 0; i < response.cities.length; i++){
      let newCity = new City(response.cities[i].name, response.cities[i].country);
      cityArray.push(Object.values(newCity).toString());
    }        
  }
};
xhttp.open('GET', 'current.city.list.min.json', true);
xhttp.send();



//function to print selected dropdown list city onto input field
function selectCity(e){
  citySelection = e.target.textContent;
  document.getElementById('city-input').value = citySelection;
  deleteDropdown();

  //find the weather info from openweather API using {city},{country} (london,gb)
  //find the lat long info from openweather API and zoom google map to the location
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      let response = JSON.parse(xhttp.responseText);
      //console.log(response); 
      if(forecast.classList.contains('inactive')){
        currentWeather(response);
      } else {
        forecastWeather(response);
      }
    }
  };
  if(forecast.classList.contains('inactive')){
    xhttp.open('GET', `https://api.openweathermap.org/data/2.5/weather?q=${citySelection}&appid=bfacc96b28036034f428cbe9a5293b1b`);
  } else {
    xhttp.open('GET', `https://api.openweathermap.org/data/2.5/forecast?q=${citySelection}&appid=bfacc96b28036034f428cbe9a5293b1b`);
  }
  xhttp.send();
  document.getElementById('city-input').value = "";
}


//function to delete dropdown box
const elements = document.getElementsByClassName('dropdown-item-map');
let	element;
function deleteDropdown(){
	while (element = elements[0]) {
		element.parentNode.removeChild(element);
	} 
};



//functions to choose between current and forecast
const current = document.getElementById('current');
const forecast = document.getElementById('forecast');
current.addEventListener('click', runCurrent);
forecast.addEventListener('click', runForecast);

const hoursArray = document.querySelectorAll('.hours');

function runCurrent(){
  current.classList.toggle('inactive');
  forecast.classList.add('inactive');
  hoursArray.forEach(e => {
    e.classList.add('hidden');
  });
  deletePopups()
}



function runForecast(){
  forecast.classList.toggle('inactive');
  current.classList.add('inactive');
  hoursArray.forEach(e => {
    e.classList.remove('hidden');
  });
}

//function to pick which hours under forecast
hoursArray.forEach(e => {
  e.addEventListener('click', e => {
    e.target.parentNode.classList.remove('inactive');
    for(i = 0; i < hoursArray.length; i++){
      if(hoursArray[i] !== e.target.parentNode){
        hoursArray[i].classList.add('inactive');
      }
    }
    deletePopups(); 
  });
});


//function to decide which forecast by hour to show
function forecastHour(){
  for(i = 0; i < hoursArray.length; i++){
    if(!hoursArray[i].classList.contains('inactive')){
      return hoursArray[i];
    }
  }
}


//function to produce city search function real time
const cityInput = document.getElementById('city-input');
cityInput.addEventListener('keyup', valueCapture);

function valueCapture(e){
  const input = e.target.value;
  if(input.length > 3){
    const searchTerm = input;
    const searchRegex = new RegExp(searchTerm, 'i');
    const dropdownList = [];
    for(i = 0; i < cityArray.length; i++){
      if(searchRegex.test(cityArray[i])){
        dropdownList.push(cityArray[i]);
      }
    }
    //print dropdown list
    deleteDropdown();
    for(i = 0; i < dropdownList.length; i++){
      document.getElementById('dropdown-list').innerHTML += `<li class="dropdown-item">${dropdownList[i]}</li>`;
    }
    //select from dropdown list and fill in input field with selection
		document.getElementById('dropdown-list').onclick = selectCity;
  } else {
    deleteDropdown();
  }
}


//function to create popup card on google maps
let popupList = [];
function createPopupCard(x){
  infoWindow = document.createElement('div');
  Popup = createPopupClass(x);
  popup = new Popup(
      center,
      infoWindow
      )
  popup.setMap(map);

  //function to remove one popup-container when x is clicked
  popupList.push(popup.containerDiv.firstChild.firstChild);
  popupList.forEach((elem) => {
    elem.addEventListener('click', (e) => {
      if(e.target.classList.contains('btn-text')){
        let toRemove = e.target.parentElement.parentElement.parentElement;
        setTimeout(() => { 
          toRemove.remove(); 
        }, 290);
        toRemove.style.animationName = 'fadeout';
        toRemove.style.animationDuration = '.3s';
      }
    })
  });
}


//function to populate popup with current weather info
let citySelection, lng, lat, center, weatherInfo, infoWindow;

function currentWeather(x){
  lng = x.coord.lon;
  lat = x.coord.lat;
  center = new google.maps.LatLng(lat, lng);
  map.panTo(center);

  //populating the Info Window with weather infor
  weatherInfo = `<h4>${x.name}</h4><button class="btn-close"><p class="btn-text">x</p></button><p>${(x.main.temp-273.15).toFixed(1)} C<p>${x.weather[0].description}</p><img class="center weather-image" src="http://openweathermap.org/img/wn/${x.weather[0].icon}.png" alt="weather-image-placeholder" >`;
  
  // weatherInfo = '<h4>'+x.name+'</h4>'+'<button class="btn-close"><p class="btn-text">x</p></button>'+'<p>'+(x.main.temp-273.15).toFixed(1)+' C'+'<p>'+x.weather[0].description+'</p>'+'<img class="center weather-image" src="http://openweathermap.org/img/wn/'+x.weather[0].icon+'.png"'+'alt="weather-image-placeholder" >';
  //call the Popup object, passing weatherInfo 
  createPopupCard(weatherInfo);
}


//function to remove all popup containers. Divs with class of 'popup-container'
function deletePopups(){
  const popupContainers = document.getElementsByClassName('popup-container');
  const popupContainersArray = [].slice.call(popupContainers);
  popupContainersArray.forEach(e => e.parentNode.removeChild(e));
}


//function to populate popup with forecast info
function forecastWeather(x){
  lng = x.city.coord.lon;
  lat = x.city.coord.lat;
  center = new google.maps.LatLng(lat, lng);
  map.panTo(center);
  let chosenHour = forecastHour();
  let chosenHourText = chosenHour.textContent;

  //populating the popup with the chosen forecast by hour
  weatherInfo = function(forecast, hour){
    return `<h4>${x.city.name}</h4><button class="btn-close"><p class="btn-text">x</p></button><p>${(x.list[forecast].main.temp-273.15).toFixed(1)} C<p>${x.list[forecast].weather[0].description}</p><img class="center weather-image" src="http://openweathermap.org/img/wn/${x.list[forecast].weather[0].icon}.png"+alt="weather-image-placeholder"><p>${hour} hours from now</p>`;
  }

  switch(chosenHourText) {
    case "3 hours":
      weatherInfo = weatherInfo(0, 3);
      break;
    case "6 hours":
      weatherInfo = weatherInfo(1, 6);
      break;
    case "12 hours":
      weatherInfo = weatherInfo(3, 12);
      break;
    case "24 hours":
      weatherInfo = weatherInfo(7, 24);
      break;
  }
    //call the Popup object, passing weatherInfo
    createPopupCard(weatherInfo);
}


//from google maps API - function to create google map API custom popup, passing weatherInfo from selectCity function
function createPopupClass(x) {
  /**
   * A customized popup on the map.
   * @param {!google.maps.LatLng} position
   * @param {!Element} content The bubble div.
   * @constructor
   * @extends {google.maps.OverlayView}
   */
  function Popup(position, content) {
    this.position = position;

    content.classList.add('popup-bubble');
    content.innerHTML = x;

    // This zero-height div is positioned at the bottom of the bubble.
    var bubbleAnchor = document.createElement('div');
    bubbleAnchor.classList.add('popup-bubble-anchor');
    bubbleAnchor.appendChild(content);

    // This zero-height div is positioned at the bottom of the tip.
    this.containerDiv = document.createElement('div');
    this.containerDiv.classList.add('popup-container');
    this.containerDiv.appendChild(bubbleAnchor);

    // Optionally stop clicks, etc., from bubbling up to the map.
    google.maps.OverlayView.preventMapHitsAndGesturesFrom(this.containerDiv);
  }
  // ES5 magic to extend google.maps.OverlayView.
  Popup.prototype = Object.create(google.maps.OverlayView.prototype);

  /** Called when the popup is added to the map. */
  Popup.prototype.onAdd = function() {
    this.getPanes().floatPane.appendChild(this.containerDiv);
  };

  /** Called when the popup is removed from the map. */
  Popup.prototype.onRemove = function() {
    if (this.containerDiv.parentElement) {
      this.containerDiv.parentElement.removeChild(this.containerDiv);
    }
  };

  /** Called each frame when the popup needs to draw itself. */
  Popup.prototype.draw = function() {
    var divPosition = this.getProjection().fromLatLngToDivPixel(this.position);

    // Hide the popup when it is far out of view.
    var display =
        Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000 ?
        'block' :
        'none';

    if (display === 'block') {
      this.containerDiv.style.left = divPosition.x + 'px';
      this.containerDiv.style.top = divPosition.y + 'px';
    }
    if (this.containerDiv.style.display !== display) {
      this.containerDiv.style.display = display;
    }
  };    
  return Popup;
}




   
  







