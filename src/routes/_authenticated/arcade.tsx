import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Gamepad2, Moon, History, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/lunaria/app-shell";
import { PanelTitle, fieldCls } from "@/components/lunaria/bits";
import { useProfile, useSaveProfile } from "@/lib/profile";
import { supabase } from "@/integrations/supabase/client";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/_authenticated/arcade")({
  head: pageHead("Arcade", "A tiny corner for play and little challenges."),
  component: Arcade,
});

const SYMBOLS = ["✿", "☾", "★", "♡", "❀", "✦", "☁", "♪"];

const shuffle = () =>
  [...SYMBOLS, ...SYMBOLS]
    .map((s) => ({ s, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map((x) => x.s);

type GameRecord = {
  id: string;
  game_name: string;
  score: number | null;
  moves: number | null;
  attempts: number | null;
  duration_seconds: number | null;
  result: string;
  played_at: string;
};

function Arcade() {
  const profile = useProfile();
  const save = useSaveProfile();

  const [cards, setCards] = useState<string[]>(shuffle);
  const [flip, setFlip] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const [target, setTarget] = useState(
    () => 1 + Math.floor(Math.random() * 50)
  );
  const [guess, setGuess] = useState("");
  const [hint, setHint] = useState(
    "I'm thinking of a number from 1 to 50…"
  );
  const [tries, setTries] = useState(0);

  const [history, setHistory] = useState<GameRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [savingGame, setSavingGame] = useState(false);

  const memoryStarted = useRef(Date.now());
  const memorySaved = useRef(false);
  const moonStarted = useRef(Date.now());
  const moonSaved = useRef(false);

  const won = matched.length === cards.length;

  async function loadHistory() {
    const { data: auth } = await supabase.auth.getUser();

    if (!auth.user) {
      setLoadingHistory(false);
      return;
    }

    const { data, error } = await supabase
      .from("arcade_game_history")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("played_at", { ascending: false })
      .limit(30);

    if (error) {
      toast.error("Could not load game history: " + error.message);
    } else {
      setHistory((data ?? []) as GameRecord[]);
    }

    setLoadingHistory(false);
  }

  async function recordGame(
    gameName: string,
    details: {
      score?: number;
      moves?: number;
      attempts?: number;
      duration?: number;
    }
  ) {
    const { data: auth } = await supabase.auth.getUser();

    if (!auth.user) {
      toast.error("Please sign in to save your game history.");
      return false;
    }

    setSavingGame(true);

    const { error } = await supabase
      .from("arcade_game_history")
      .insert({
        user_id: auth.user.id,
        game_name: gameName,
        score: details.score ?? 0,
        moves: details.moves ?? null,
        attempts: details.attempts ?? null,
        duration_seconds: details.duration ?? null,
        result: "completed",
        details,
      });

    setSavingGame(false);

    if (error) {
      toast.error("Could not save game: " + error.message);
      return false;
    }

    await loadHistory();
    return true;
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  // Save Memory Garden result once when all cards are matched.
  useEffect(() => {
    if (!won || moves <= 0 || memorySaved.current) return;

    memorySaved.current = true;

    const duration = Math.floor(
      (Date.now() - memoryStarted.current) / 1000
    );

    void recordGame("Memory Garden", {
      score: Math.max(0, 1000 - moves * 10),
      moves,
      duration,
    });

    const best = profile.data?.prefs.arcadeBest;

    if (!best || moves < best) {
      save.mutate({ prefs: { arcadeBest: moves } });
    }
  }, [won, moves]);

  useEffect(() => {
    if (flip.length !== 2) return;

    const [a, b] = flip as [number, number];

    const timer = setTimeout(() => {
      if (cards[a] === cards[b]) {
        setMatched((current) => [...current, a, b]);
      }

      setFlip([]);
    }, 650);

    return () => clearTimeout(timer);
  }, [flip, cards]);

  function resetMemory() {
    setCards(shuffle());
    setFlip([]);
    setMatched([]);
    setMoves(0);
    memoryStarted.current = Date.now();
    memorySaved.current = false;
  }

  async function submitGuess(e: React.FormEvent) {
    e.preventDefault();

    const g = Number(guess);

    if (!g || g < 1 || g > 50 || moonSaved.current) return;

    const nextTries = tries + 1;

    setTries(nextTries);
    setGuess("");

    if (g === target) {
      moonSaved.current = true;
      setHint(`Yes! ${target} in ${nextTries} tries ☾`);

      const duration = Math.floor(
        (Date.now() - moonStarted.current) / 1000
      );

      await recordGame("Moon Guess", {
        score: Math.max(0, 500 - nextTries * 20),
        attempts: nextTries,
        duration,
      });
    } else if (g < target) {
      setHint(`${g} is too low — reach higher ✦`);
    } else {
      setHint(`${g} is too high — float lower ✧`);
    }
  }

  function resetMoon() {
    setTarget(1 + Math.floor(Math.random() * 50));
    setTries(0);
    setGuess("");
    setHint("A new number is hiding from 1 to 50…");
    moonStarted.current = Date.now();
    moonSaved.current = false;
  }

  function formatDuration(seconds: number | null) {
    if (seconds == null) return "—";
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
  }

  return (
    <>
      <Hero
        title="Arcade"
        blurb="A tiny corner for play and little challenges."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="panel p-5">
          <PanelTitle
            icon={Gamepad2}
            title="Memory Garden"
            tone="bg-lilac"
            right={
              <span className="text-sm text-muted-foreground">
                Moves {moves} · Best{" "}
                {profile.data?.prefs.arcadeBest ?? "—"}
              </span>
            }
          />

          <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
            {cards.map((symbol, i) => {
              const up =
                flip.includes(i) || matched.includes(i);

              return (
                <button
                  key={i}
                  aria-label={up ? symbol : "Hidden card"}
                  disabled={up || flip.length === 2 || won}
                  onClick={() => {
                    setFlip([...flip, i]);
                    if (flip.length === 1) {
                      setMoves((current) => current + 1);
                    }
                  }}
                  className={`grid aspect-square place-items-center rounded-2xl text-3xl transition ${
                    matched.includes(i)
                      ? "bg-mint"
                      : up
                        ? "bg-petal"
                        : "bg-gradient-to-br from-lilac to-primary/60 text-transparent hover:scale-105"
                  }`}
                >
                  {up ? symbol : "?"}
                </button>
              );
            })}
          </div>

          <div className="mt-4 text-center">
            {won && (
              <p className="mb-2 text-lg">
                You grew the whole garden in {moves} moves ✧
              </p>
            )}

            <Button
              className="rounded-full"
              onClick={resetMemory}
            >
              New round
            </Button>
          </div>
        </section>

        <section className="panel p-5">
          <PanelTitle
            icon={Moon}
            title="Moon Guess"
            tone="bg-sky"
          />

          <p className="mb-3 text-sm text-muted-foreground">
            {hint}
          </p>

          <form
            className="flex gap-2"
            onSubmit={submitGuess}
          >
            <input
              className={fieldCls}
              type="number"
              min={1}
              max={50}
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              aria-label="Your guess"
              disabled={moonSaved.current}
            />

            <Button
              className="rounded-full"
              disabled={moonSaved.current || !guess}
            >
              Guess
            </Button>
          </form>

          <Button
            variant="outline"
            className="mt-3 w-full rounded-full"
            onClick={resetMoon}
          >
            New number
          </Button>

          {moonSaved.current && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Game saved to your history ✧
            </p>
          )}
        </section>
      </div>

      <section className="panel mt-4 p-5">
        <PanelTitle
          icon={History}
          title="Game history"
          tone="bg-butter"
          right={
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => void loadHistory()}
              disabled={loadingHistory || savingGame}
            >
              Refresh
            </Button>
          }
        />

        {loadingHistory ? (
          <p className="text-sm text-muted-foreground">
            Loading your game history…
          </p>
        ) : history.length === 0 ? (
          <div className="py-6 text-center">
            <Trophy className="mx-auto mb-2 size-8 text-muted-foreground" />
            <p className="font-medium">No games recorded yet</p>
            <p className="text-sm text-muted-foreground">
              Complete a game and your result will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((game) => (
              <article
                key={game.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl bg-secondary/60 p-3"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-background text-xl">
                  {game.game_name === "Memory Garden" ? "✿" : "☾"}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium">{game.game_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(game.played_at).toLocaleString()}
                  </p>
                </div>

                <div className="text-right text-xs">
                  {game.moves != null && (
                    <p>{game.moves} moves</p>
                  )}
                  {game.attempts != null && (
                    <p>{game.attempts} attempts</p>
                  )}
                  <p className="text-muted-foreground">
                    {formatDuration(game.duration_seconds)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
