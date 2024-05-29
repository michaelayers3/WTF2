/** @format */

var movieSearchInput = document.getElementById("search");
var searchResults = document.getElementById("search-results");
var movieHistory = document.getElementById("movie-history");
var historyContainer = document.getElementById("history-container");

//Takes the user inputs and sends the value to searchMovies
movieSearchInput.addEventListener("input", function (event) {
  event.preventDefault();
  var userInput = movieSearchInput.value;
  searchMovies(userInput);
});

//Fetches poster image source from a 2nd API.
function getPosters(userInput, element) {
  var options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "276bbea6c0msh1738515d078995ap177c77jsna7bb4760ed85",
      "X-RapidAPI-Host": "movie-database-alternative.p.rapidapi.com",
    },
  };
  fetch(
    "https://movie-database-alternative.p.rapidapi.com/?s=" +
      userInput +
      "&r=json&type=movie",
    options
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      element.setAttribute("src", data.Search[0].Poster);
    });
};

//Fetchs from TMDB's data base using the inputed value by the user.
function searchMovies(userInput) {
  fetch(
    "https://api.themoviedb.org/3/search/movie?api_key=59d03319215e9b420664039f4bb2b1b1&query=" +
      userInput +
      "&include_adult=false"
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      updateSearchResults(data.results);
    });
};

//Takes the results from the searchMovies functions and appends them as buttons to an ul.
//Added a clearResults function because it was continually adding items and stacking below.
function updateSearchResults(results) {
  clearResults();

  //updated code so only top 5 show

  for (var i = 0; i < 5; i++) {
    var result = results[i];
    var resultItem = document.createElement("button");
    resultItem.textContent = result.title;
    resultItem.setAttribute("href", "#");
    resultItem.addEventListener("click", function (event) {
      event.preventDefault();
      var title = event.target.textContent;
      getMovieData(title);
      clearResults();
    });
    searchResults.appendChild(resultItem);
  }
};

//Clears the search results before updating the list with new search results as user types.
function clearResults() {
  searchResults.innerHTML = "";
};

//Takes input from search results and pulls the movie name and movie id from it.
//Calls getMovieStreamingData with the id pulled.
function getMovieData(input) {
  fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=59d03319215e9b420664039f4bb2b1b1&query=${input}`
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var movieData = {
        movieId: data.results[0].id,
        movieName: data.results[0].title,
      };
      saveMovieData(movieData);
    });
};

//Saves movie data to local storage
function saveMovieData(data) {
  var movieData = JSON.parse(localStorage.getItem("movieData")) || [];
  for (let i = 0; i < movieData.length; i++) {
    if (movieData[i].movieName === data.movieName) {
      return;
    }
  }
  movieData.push(data);
  localStorage.setItem("movieData", JSON.stringify(movieData));
  getMovieStreamingData(data);
};

function loadFromLocalStorage() {
  var movieData = JSON.parse(localStorage.getItem("movieData")) || [];
  for (let i = 0; i < movieData.length; i++) {
    getMovieStreamingData(movieData[i]);
}};

function updateContainerDisplay() {
  if (localStorage.getItem("movieData")) {
    historyContainer.style.display = "block"; 
  } else {
    historyContainer.style.display = "none"; 
  }
};

updateContainerDisplay();

function clearMovieCards() {
  document.querySelectorAll(".movie-card").innerHTML = "";
  updateContainerDisplay();
};

//Generates a card pulling the data from local storage
function createMovieCard(movieName, streamingServices) {
  clearMovieCards();
  var movieCard = document.createElement("div");
  var movieInfo = document.createElement("h4");
  var moviePoster = document.createElement("img");

  movieCard.classList.add("movie-card");
  if (!streamingServices.length) {
    movieInfo.textContent = `We couldn't find ${movieName}.`;
    const googleLink = document.createElement('a');
    googleLink.href = `https://www.google.com/search?q=${movieName}+movie`;
    googleLink.textContent = ` ${movieName}`;
    googleLink.target= '_blank';
    movieInfo.appendChild(googleLink);

  } else {
    movieInfo.textContent = `${movieName} Streaming on ${streamingServices.join(", ")}`;
  }

  movieCard.appendChild(movieInfo);
  movieCard.appendChild(moviePoster);
  getPosters(movieName, moviePoster);
  movieHistory.appendChild(movieCard);
};

//Takes the id and fetches the current streaming services from TMDB's database.
function getMovieStreamingData(movieData) {
  fetch(
    "https://api.themoviedb.org/3/movie/" +
      movieData.movieId +
      "/watch/providers?api_key=59d03319215e9b420664039f4bb2b1b1&language=en-US"
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var streamingServices = [];
      var dataResultsUS = data.results.US;
      if (!dataResultsUS) {
      } else if (dataResultsUS && dataResultsUS.flatrate) {
        for (let i = 0; i < dataResultsUS.flatrate.length; i++) {
          streamingServices.push(dataResultsUS.flatrate[i].provider_name);
        }
      }
      createMovieCard(movieData.movieName, streamingServices);
    });
};

//Clears local storage and deletes the buttons created in the history.
function clearLocalStorage(event) {
  event.preventDefault();
  localStorage.clear();
  var movieCards = document.querySelectorAll(".movie-card");
  for (let i = 0; i < movieCards.length; i++) {
    movieCards[i].remove();
  }
  updateContainerDisplay();
};

//Calls clearLocalStorage.
document.getElementById("clear-history").addEventListener("click", clearLocalStorage);

loadFromLocalStorage();
