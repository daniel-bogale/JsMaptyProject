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
    }

    _setDescription() {
        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];

        this.description = `${(this.type[0]).toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
    }
}

class Running extends Workout {
    type = "running";
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
    }

    calcPace() {
        this.pace = (this.duration / this.distance);
        return this.pace;
    }
}
class Cycling extends Workout {
    type = "cycling";
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
        this._setDescription();
    }
    calcSpeed() {
        this.speed = (this.distance / (this.duration / 60));
        return this.speed;
    }
}

/////////////////////////////////////
////////////////////////////////////

class App {
    mapEvent;
    map;
    workout = [];

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

        form.classList.remove("hidden");
        inputDistance.focus();
    }
    _hideForm() {
        inputDistance.value =
            inputElevation.value =
            inputCadence.value =
            inputDuration.value =
            "";
        form.style.display = "none";
        setTimeout(() => { form.style.display = "grid"; }, 1000)

        form.classList.add("hidden");
    }


    _toggleElevationField() {
        inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
        inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    }


    _newWorkout(e) {
        const validInputs = (...inputs) =>
            inputs.every((inp) => Number.isFinite(inp));

        const allPositive = (...inputs) => inputs.every((inp) => inp > 0);



        e.preventDefault();

        //get data from input
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.mapEvent.latlng;
        const popLocation = [lat, lng];
        let workout;
        let popupContent;

        //check if data is valid and  // if activity running/cycling create running/cycling object

        if (type == "running") {
            const cadence = +inputCadence.value;

            if (!validInputs(distance, duration, cadence) ||
                !allPositive(distance, duration, cadence)
            )
                return alert("Inputs have to be positive number");
            workout = new Running(popLocation, distance, duration, cadence);

            this.popupContent = `<span>🏃‍♂️</span> Running on ${workout.date.getFullYear()}`;
        }

        if (type == "cycling") {
            const elevationGain = +inputElevation.value;
            if (!validInputs(distance, duration, elevationGain) ||
                !allPositive(distance, duration)
            )
                return alert("Inputs have to be positive number");
            workout = new Cycling(popLocation, distance, duration, elevationGain);

            this.popupContent = `<span>🚴‍♀️</span> Cycling on ${workout.date.getFullYear()}`;
        }

        this.workout.push(workout);

        this.renderWorkoutMarker(workout);

        this._renderWorkout(workout);

        this._hideForm();


    }
    renderWorkoutMarker(workout) {
        // set a view on the area where the clicked position is center

        this.map.setView(workout.coords, 13);

        // marker and popup option
        const popOption = {
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: `${workout.type}-popup`,
        };

        L.marker(workout.coords)
            .addTo(this.map)
            .bindPopup(L.popup(popOption))
            .setPopupContent(this.popupContent)
            .openPopup();
    }
    _renderWorkout(workout) {
        let html;

        html = ` <li class="workout workout--${workout.type == "running"?"running":"cycling"}" data-id=${workout.id}>
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
            <span class="workout__icon">${
              workout.type == "running" ? "🏃‍♂️" : "🚴‍♀️"
            } </span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
        </div>`;

        if (workout.type == "running") {
            html += `<div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.pace.toFixed(1)}
                </span>
                <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workout.cadence}</span>
                <span class="workout__unit">spm</span>
            </div>
        </li>
        `;
        }

        if (workout.type == "cycling") {
            html += `
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.speed.toFixed(1)}</span>
                <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⛰</span>
                <span class="workout__value">${workout.elevationGain}</span>
                <span class="workout__unit">min</span>
            </div>
        </li>`;
        }

        form.insertAdjacentHTML("afterend", html);
    }
}

const app = new App();
app._getPosition();