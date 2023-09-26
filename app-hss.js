import express, { json } from "express"; // requires ===> commonJS
import { createMovieRouter } from "./routes/movies.js";
import { corsMiddleware } from "./middlewares/cors.js";
import "dotenv/config";

export const createApp = ({ movieModel }) => {
  const app = express();
  app.use(json());
  app.use(corsMiddleware());
  app.disable("x-powered-by"); // disable

  //all the resources that be movies will be identified with /movies
  app.use("/movies", createMovieRouter({ movieModel }));

  const PORT = process.env.PORT ?? 1234;

  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });
};
