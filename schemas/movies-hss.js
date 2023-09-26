import z from "zod";

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: "Movie title must be a string",
    required_error: "Movie title is required",
  }),
  year: z.number().int().positive().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  poster: z.string().url({ message: "Poster mus be a valid URL!" }),
  rate: z.number().min(0).max(10).default(5.5),
  genre: z.array(
    z.enum([
      "Action",
      "Adventure",
      "Crime",
      "Comedy",
      "Drama",
      "Fantasy",
      "Terror",
      "Thriller",
      "Sci-Fi",
    ]),
    {
      invalid_type_error: "Movie genre must be an array of enum Genre",
      required_error: "Movie genre is required",
    }
  ),
});

export function validateMovie(input) {
  return movieSchema.safeParse(input);
}

export function validatePartialMovie(input) {
  return movieSchema.partial().safeParse(input);
}
