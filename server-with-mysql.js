import { createApp } from "./app-hss.js";
import { MovieModel } from "./models/mysql/movie.js";

createApp({ movieModel: MovieModel });
