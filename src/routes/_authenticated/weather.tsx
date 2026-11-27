
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CloudSun, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/lunaria/app-shell";
import { PanelTitle, fieldCls } from "@/components/lunaria/bits";
import { useProfile, useSaveProfile } from "@/lib/profile";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/_authenticated/weather")({
  head: pageHead("World Weather", "A little window to places around the world."),
  component: Weather,
});

type W = {
  place: string;
  country: string;
  temp: number;
  feels: number;
  humidity: number;
  wind: number;
  code: number;
  days: {
    date: string;
    max: number;
    min: number;
    code: number;
  }[];
};

export function weatherEmoji(c: number) {
  return c === 0 ? "☀️" :
    c <= 2 ? "🌤️" :
    c === 3 ? "☁️" :
    c <= 48 ? "🌫️" :
    c <= 67 ? "🌧️" :
    c <= 77 ? "❄️" :
    c <= 82 ? "🌦️" : "⛈️";
}

async function fetchWeather(city: string): Promise<W> {
  const g = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
  ).then((r) => r.json());

  const p = g.results?.[0];

  if (!p) {
    throw new Error(`Couldn't find “${city}”.`);
  }

  const f = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`
  ).then((r) => r.json());

  if (!f.current || !f.daily) {
    throw new Error("Weather data is unavailable.");
  }

  return {
    place: p.name,
    country: p.country ?? "",
    temp: f.current.temperature_2m,
    feels: f.current.apparent_temperature,
    humidity: f.current.relative_humidity_2m,
    wind: f.current.wind_speed_10m,
    code: f.current.weather_code,
    days: f.daily.time.map((d: string, i: number) => ({
      date: d,
      max: f.daily.temperature_2m_max[i],
      min: f.daily.temperature_2m_min[i],
      code: f.daily.weather_code[i],
    })),
  };
}

function Weather() {
  const profile = useProfile();
  const save = useSaveProfile();

  const [city, setCity] = useState("");
  const [w, setW] = useState<W | null>(null);
  const [busy, setBusy] = useState(false);

  async function go(c: string) {
    setBusy(true);

    try {
      setW(await fetchWeather(c));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function makeHomeCity() {
    if (!profile.data?.id) {
      toast.error("Profile is not ready. Please try again.");
      return;
    }

    if (!w) {
      toast.error("Search for a city first.");
      return;
    }

    save.mutate(
      { prefs: { weatherCity: w.place } },
      {
        onSuccess: () => {
          toast.success(`${w.place} is now your home city!`);
        },
        onError: (error) => {
          toast.error(`Couldn't save home city: ${error.message}`);
        },
      }
    );
  }

  useEffect(() => {
    if (profile.data && !w) {
      void go(profile.data.prefs.weatherCity ?? "Jakarta");
    }
  }, [profile.data?.id]);

  const isHomeCity =
    !!w && profile.data?.prefs.weatherCity === w.place;

  return (
    <>
      <Hero
        title="World Weather"
        blurb="A little window to places around the world."
      />

      <section className="panel p-5">
        <PanelTitle
          icon={CloudSun}
          title="Weather around the world"
          tone="bg-sky"
        />

        <form
          className="mb-5 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (city.trim()) void go(city.trim());
          }}
        >
          <input
            className={fieldCls}
            placeholder="Search a city — Tokyo, Paris, Bandung…"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <Button className="rounded-full" disabled={busy}>
            {busy ? "…" : "Find weather"}
          </Button>
        </form>

        {w && (
          <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
            <div className="hero-gradient rounded-3xl p-6 text-center">
              <div className="text-6xl floaty">
                {weatherEmoji(w.code)}
              </div>

              <h2 className="mt-2 text-2xl">{w.place}</h2>
              <p className="text-sm text-muted-foreground">
                {w.country}
              </p>

              <p className="mt-2 font-display text-5xl">
                {Math.round(w.temp)}°
              </p>

              <p className="text-sm text-muted-foreground">
                Feels {Math.round(w.feels)}° · Humidity {w.humidity}% ·
                Wind {Math.round(w.wind)} km/h
              </p>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 rounded-full"
                disabled={save.isPending || !profile.data}
                onClick={makeHomeCity}
              >
                <Star
                  className={isHomeCity ? "fill-current" : ""}
                />
                {save.isPending
                  ? "Saving..."
                  : isHomeCity
                    ? "Your home city"
                    : "Make home city"}
              </Button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {w.days.map((d) => (
                <div
                  key={d.date}
                  className="flex flex-col items-center gap-1 rounded-2xl bg-background/60 p-2 text-center text-sm"
                >
                  <span className="text-xs text-muted-foreground">
                    {new Date(d.date + "T00:00").toLocaleDateString(
                      undefined,
                      { weekday: "short" }
                    )}
                  </span>

                  <span className="text-2xl">
                    {weatherEmoji(d.code)}
                  </span>

                  <b>{Math.round(d.max)}°</b>

                  <span className="text-muted-foreground">
                    {Math.round(d.min)}°
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="mt-4 text-xs text-muted-foreground">
          Live forecasts by Open-Meteo.
        </p>
      </section>
    </>
  );
}
