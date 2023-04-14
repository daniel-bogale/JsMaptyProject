// const { map } = require("leaflet");
// "use strict";

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class Workout {
    date = new Date();
    id = (Date.now() + "").slice(-10);

    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
        console.log(this.id);
    }
}

class Running extends Workout {
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
    }

    calcPace() {
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}
class Cycling extends Workout {
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
    }
    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

const workout = new Workout(2, 2, 3);

const run1 = new Running([39, -12], 5.2, 24, 178);

console.log(run1.pace);

const cycl1 = new Cycling([39, -12], 5.2, 4, 178);

console.log(cycl1.speed);

/////////////////////////////////////
////////////////////////////////////

class App {
    mapEvent;
    map;

    constructor() {
        this._getPosition();
        form.addEventListener("submit", this._newWorkout.bind(this));
        inputType.addEventListener("change", this._toggleElevationField);
    }
    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this),
                function() {
                    alert("Could not get your postion");
                }
            );
        }
    }
    _loadMap(position) {
        // console.log("loaded");
        const { latitude, longitude } = position.coords;
        const coords = [latitude, longitude];

        this.map = L.map("map").setView(coords, 13);

        L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.map);

        //handling clicks on map
        this.map.on("click", this._showForm.bind(this));
    }

    _showForm(e) {
        this.mapEvent = e;
        // mapEvent = e;

        form.classList.remove("hidden");
        inputDistance.focus();
    }
    _toggleElevationField() {
        inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
        inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    }
    _newWorkout(e) {
        const validInputs = (...inputs) =>
            inputs.every((inp) => Number.isFinite(inp));

        const allPositive = (...inputs) => inputs.every(inp => inp > 0);

        e.preventDefault();

        //get data from input
        const type = inputType.value;
        const distance = +inputDistance.value;

        const duration = +inputDuration.value;



        //check if data is valid

        // if activity running/cycling create running/cycling object

        if (type == "running") {
            const cadence = +inputCadence.value;
            // console.log(Number.isFinite(cadence), Number.isFinite(distance), Number.isFinite(duration))

            if (!validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence))
                return alert("Inputs have to be positive number");
        }
        if (type == "cycling") {
            const elevationGain = +inputElevation.value;
            if (!validInputs(distance, duration, elevationGain) || !allPositive(distance, duration))
                return alert("Inputs have to be positive number");
        }

        //add new object to workout array

        //render workout on map as marker

        // get the clicked location
        const { lat, lng } = this.mapEvent.latlng;
        const popLocation = [lat, lng];

        //clear input fields
        inputDistance.value =
            inputElevation.value =
            inputCadence.value =
            inputDuration.value =
            "";

        // set a view on the area where the clicked position is center
        this.map.setView(popLocation, 13);

        // marker and popup option
        const popOption = {
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: "running-popup",
        };

        L.marker(popLocation)
            .addTo(this.map)
            .bindPopup(L.popup(popOption))
            .setPopupContent("Workout")
            .openPopup();

        form.classList.add("hidden");
    }
}

const app = new App();
app._getPosition();