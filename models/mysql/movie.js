import mysql from "mysql2/promise";

const DEFAULT_CONFIG = {
  host: "localhost",
  user: "root",
  port: 3306,
  password: "",
  database: "moviesdb",
};

const connectionString = process.env.DATABASE_URL ?? DEFAULT_CONFIG;
const connection = await mysql.createConnection(connectionString);

export class MovieModel {
  static async getAll({ genre }) {
    if (genre) {
      const [genres] = await connection.query(
        "SELECT id, name FROM genre WHERE LOWER(name) = ?;",
        [genre.toLowerCase()]
      );

      if (genres.length === 0) return [];

      const [{ id }] = genres;

      const [movies] = await connection.query(
        "SELECT movie.title, movie.year, movie.director, movie.duration, movie.poster, movie.rate, BIN_TO_UUID(movie.id) FROM movie JOIN movie_genres ON movie.id = movie_genres.movie_id WHERE movie_genres.genre_id = ?",
        [id]
      );

      return movies;
    }

    const [movies, tableInfo] = await connection.query(
      `SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) FROM movie;`
    );
    return movies;
  }

  static async getById({ id }) {
    const [movies] = await connection.query(
      "SELECT title, year, Director, duration, poster, rate, BIN_TO_UUID(id) FROM movie WHERE id = UUID_TO_BIN(?);",
      [id]
    );

    if (movies.length === 0) return [];

    return movies[0];
  }

  static async create({ input }) {
    const { title, year, director, duration, poster, genre, rate } = input;
    const [uuidResult] = await connection.query("SELECT UUID() uuid");
    const [{ uuid }] = uuidResult;
    const values = [uuid, title, year, director, duration, poster, rate];
    const sql = `INSERT INTO movie (id, title, year, director, duration, poster, rate) VALUES (UUID_TO_BIN(?),?,?,?,?,?,? );`;

    try {
      const result = await connection.query(sql, values);
    } catch (error) {
      throw new Error("An error ocurred creating movie!!");
    }

    const [movie] = await connection.query(
      "SELECT title, year, Director, duration, poster, rate, BIN_TO_UUID(id) as idReadable FROM movie WHERE id = UUID_TO_BIN(?);",
      [uuid]
    );

    genre.forEach(async (value) => {
      const [genre] = await connection.query(
        "SELECT id, name FROM genre WHERE LOWER(name) = ?;",
        [value]
      );
      const values = [movie[0].idReadable, genre[0].id];
      const sql = `INSERT INTO movie_genres (movie_id, genre_id) VALUES (UUID_TO_BIN(?),?);`;

      try {
        const result = await connection.query(sql, values);
        console.log("🚀🚀🚀 ~ ~ result:", result);
      } catch (error) {
        throw new Error("An error ocurred creating movie_genres!!");
      }
    });

    //Pending get all te genres related a movie....

    // const sql2 = `SELECT genre.name, BIN_TO_UUID(movie_genres.movie_id)  FROM genre INNER JOIN movie_genres ON movie_genres.genre_id = genre.id WHERE BIN_TO_UUID(movie_genres.movie_id) = '${movie[0].idReadable}' ;`;
    // const [genresaaa] = await connection.query(sql2);
    // console.log("🚀 ~ file: movie.js:94 ~ MovieModel ~ create ~ sql2:", sql2);
    // console.log(
    //   "🚀 ~ file: movie.js:94 ~ MovieModel ~ create ~ genresaaa:",
    //   genresaaa
    // );

    return movie[0];
  }

  static async delete({ id }) {
    try {
      const result = await connection.query(
        "DELETE FROM movie WHERE id = UUID_TO_BIN(?);",
        [id]
      );
      return result;
    } catch (error) {
      throw new Error("An error ocurred Deleting moovie!!");
    }
  }

  static async update({ id, input }) {
    try {
      const [movies, tableInfo] = await connection.query(
        `SELECT title, year, director, duration, poster, rate FROM movie WHERE id = UUID_TO_BIN(?);`,
        [id]
      );

      const updatedMovie = {
        ...movies[0],
        ...input,
      };

      const result = await connection.query(
        `UPDATE movie SET title = ?, year = ?, director = ?, duration = ?,poster = ?, rate = ? WHERE id = UUID_TO_BIN('${id}');`,
        Object.values(updatedMovie)
      );

      const [moviesUpdated] = await connection.query(
        `SELECT title, year, director, duration, poster, rate FROM movie WHERE id = UUID_TO_BIN(?);`,
        [id]
      );

      return moviesUpdated;
    } catch (error) {
      console.log(
        "🚀 ~ file: movie.js:130 ~ MovieModel ~ update ~ error:",
        error
      );
      throw new Error("An error ocurred Updating  moovie!!");
    }
  }
}
