import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovie } from "./useMovie";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const key = "263c3233";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [selectedID, setSelectedID] = useState(null);
  const [query, setQuery] = useState("");
  const { movies, isLoading, error } = useMovie(query, handleClose);

  const [watched, setWatched] = useLocalStorageState([], "watched");
  function handleAddWatchedMovies(newWatchedMovie) {
    setWatched((watched) => [...watched, newWatchedMovie]);
  }

  function handleDeleteMovies(id) {
    const newArray = watched.filter((el) => el.imdbID !== id);
    setWatched(newArray);
  }

  function handleClose() {
    setSelectedID(null);
  }

  return (
    <>
      <NavBar>
        <Logo />
        <SearchResults query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <SearchMovie
              movies={movies}
              selectedID={selectedID}
              setSelectedID={setSelectedID}
            />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedID ? (
            <MovieDetails
              selectedID={selectedID}
              handleClose={handleClose}
              onAddWatched={handleAddWatchedMovies}
              watchedMovies={watched}
            />
          ) : (
            <>
              <Summary watched={watched} />
              <WatcheList watched={watched} onDelete={handleDeleteMovies} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span> {message}
    </p>
  );
}

function MovieDetails({
  selectedID,
  watchedMovies,
  handleClose,
  onAddWatched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const count = useRef(0);
  useEffect(
    function () {
      if (userRating) count.current++;
    },
    [userRating]
  );

  const isAdded = watchedMovies.some(
    (element) => element.imdbID === selectedID
  );

  const watchedUserrating = watchedMovies.find(
    (element) => element.imdbID === selectedID
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newWatchedItem = {
      imdbID: selectedID,
      imdbRating: Number(imdbRating),
      year,
      title,
      poster,
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countrating: count.current,
    };
    onAddWatched(newWatchedItem);
    handleClose();
  }

  useEffect(
    function () {
      async function getMovieDetails() {
        try {
          setIsLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${key}&i=${selectedID}`
          );
          const data = await res.json();
          setMovie(data);
        } catch (err) {
          console.log(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      getMovieDetails();
    },
    [selectedID]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );

  useKey("Escape", handleClose);

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={() => handleClose()}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of${title} movie`} />
            <div className="details-overview">
              <h2>{title} </h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                ImDB rating:{imdbRating}
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isAdded ? (
                <>
                  <StarRating
                    maxStar={10}
                    size={34}
                    onSetRating={setUserRating}
                  />

                  {userRating > 0 && (
                    <button className="btn-add" onClick={() => handleAdd()}>
                      + Add to list{" "}
                    </button>
                  )}
                </>
              ) : (
                <p>You rated this movie: {watchedUserrating} ⭐</p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function Loader() {
  return <p className="loader">LOADING...</p>;
}

function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function SearchResults({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  function handleIsopen() {
    setIsOpen((open) => !open);
  }
  return (
    <div className="box">
      <Button onClick={handleIsopen}> {isOpen ? "–" : "+"}</Button>
      {isOpen && children}
    </div>
  );
}

function Button({ children, onClick }) {
  return (
    <button className="btn-toggle" onClick={onClick}>
      {children}
    </button>
  );
}

function WatcheList({ watched, onDelete }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedListItem movie={movie} key={movie.imdbID} onDelete={onDelete} />
      ))}
    </ul>
  );
}

function WatchedListItem({ movie, onDelete }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={() => onDelete(movie.imdbID)}>
          X
        </button>
      </div>
    </li>
  );
}

function Summary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}

function SearchMovie({ movies, selectedID, setSelectedID }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <SearchMovieItem
          movie={movie}
          key={movie.imdbID}
          selectedID={selectedID}
          setSelectedID={setSelectedID}
        />
      ))}
    </ul>
  );
}

function SearchMovieItem({ movie, selectedID, setSelectedID }) {
  return (
    <li
      onClick={() =>
        movie.imdbID === selectedID
          ? setSelectedID(null)
          : setSelectedID(movie.imdbID)
      }
      className=""
    >
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}
