const express = require("express"); // requires ===> commonJS
const crypto = require("node:crypto");
const cors = require("cors");

const movies = require("./movies.json");
const {
  validateMovie,
  validatePartialMovie,
} = require("./schemas/movies-hss.js");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        "http://localhost:8080",
        "http://localhost:1234",
        "https://movies.com",
        "https://midu.dev",
      ];

      if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      if (!origin) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.disable("x-powered-by"); // deshabilitar el header X-Powered-By: Express
// métodos normales: GET/HEAD/POST
// métodos complejos: PUT/PATCH/DELETE

// CORS PRE-Flight
// OPTIONS

//all the resources that be movies will be identified with /movies
app.get("/movies", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const { genre } = req.query;
  if (genre) {
    const filteredMovies = movies.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
    return res.json(filteredMovies);
  }
  res.json(movies);
});

app.get("/movies/:id", (req, res) => {
  //path to regexp
  const { id } = req.params;
  const movie = movies.find((movie) => movie.id === id);
  if (movie) {
    res.json(movie);
  }
  res.status(404).json({ message: "Movie not found" });
});

app.post("/movies", (req, res) => {
  const result = validateMovie(req.body);

  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  const newMovie = {
    id: crypto.randomUUID(), //uuid v4
    ...result.data,
  };

  // Esto no sería REST, porque estamos guardando
  // el estado de la aplicación en memoria
  movies.push(newMovie);

  res.status(201).json(newMovie);
});

app.get("/movies?genre", (req, res) => {
  //path to regexp
  const { id } = req.params;
  const movie = movies.find((movie) => movie.id === id);
  if (movie) {
    res.json(movie);
  }
  res.status(404).json({ message: "Movie not found" });
});

app.delete("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ message: "Movie not found" });
  }

  movies.splice(movieIndex, 1);

  return res.json({ message: "Movie deleted" });
});

app.patch("/movies/:id", (req, res) => {
  const result = validatePartialMovie(req.body);
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ message: "Movie not found" });
  }

  const updatedMovie = {
    ...movies[movieIndex],
    ...result.data,
  };

  movies[movieIndex] = updatedMovie;
  res.status(201).json(updatedMovie);
});

const PORT = process.env.PORT ?? 1234;

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
