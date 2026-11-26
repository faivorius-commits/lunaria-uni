
import { useEffect, useState } from "react";
import {
  ChefHat,
  Plus,
  Search,
  Clock,
  Trash2,
  X,
  BookOpen,
  CookingPot,
  Utensils,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { fieldCls } from "@/components/lunaria/bits";
import { supabase } from "@/integrations/supabase/client";

type Recipe = {
  id: string;
  title: string;
  description: string;
  category: string;
  prep_minutes: number;
  cook_minutes: number;
  difficulty: string;
  ingredients: string[];
  tools: string[];
  steps: string[];
  created_at: string;
};

const CATEGORIES = [
  "Breakfast",
  "Main Course",
  "Dessert",
  "Snacks",
  "Drinks",
  "Other",
];

export function RecipesPanel() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [prep, setPrep] = useState("0");
  const [cook, setCook] = useState("0");
  const [difficulty, setDifficulty] = useState("Easy");
  const [ingredients, setIngredients] = useState("");
  const [tools, setTools] = useState("");
  const [steps, setSteps] = useState("");

  async function loadRecipes() {
    setLoading(true);

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
    } else {
      setRecipes((data ?? []) as Recipe[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadRecipes();
  }, []);

  function resetForm() {
    setTitle("");
    setDescription("");
    setCategory("Other");
    setPrep("0");
    setCook("0");
    setDifficulty("Easy");
    setIngredients("");
    setTools("");
    setSteps("");
    setShowForm(false);
  }

  function toLines(value: string) {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  async function addRecipe(e: React.FormEvent) {
    e.preventDefault();

    if (
      !title.trim() ||
      !ingredients.trim() ||
      !tools.trim() ||
      !steps.trim()
    ) {
      alert("Please complete the recipe details.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("recipes")
      .insert({
        title: title.trim(),
        description: description.trim(),
        category,
        prep_minutes: Math.max(0, Number(prep) || 0),
        cook_minutes: Math.max(0, Number(cook) || 0),
        difficulty,
        ingredients: toLines(ingredients),
        tools: toLines(tools),
        steps: toLines(steps),
      });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    resetForm();
    await loadRecipes();
  }

  async function deleteRecipe(recipe: Recipe) {
    if (!confirm(`Delete "${recipe.title}"?`)) return;

    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", recipe.id);

    if (error) {
      alert(error.message);
      return;
    }

    setSelected(null);
    await loadRecipes();
  }

  const filtered = recipes.filter((recipe) =>
    `${recipe.title} ${recipe.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <section className="panel mt-8 p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <ChefHat className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">
              Collection Library
            </span>
          </div>

          <h2 className="text-2xl font-semibold">
            My Recipes
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            A little cookbook filled with your favorite creations.
          </p>
        </div>

        <Button
          className="rounded-full"
          onClick={() => {
            setSelected(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? <X /> : <Plus />}
          {showForm ? "Close" : "Add Recipe"}
        </Button>
      </div>

      {/* ADD RECIPE FORM */}
      {showForm && (
        <form
          onSubmit={addRecipe}
          className="mb-6 space-y-4 rounded-2xl border border-border p-4"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <h3 className="font-semibold">Create a recipe</h3>
          </div>

          <input
            className={fieldCls}
            placeholder="Recipe title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            className={fieldCls}
            placeholder="A little description about this recipe..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              className={fieldCls}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              className={fieldCls}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Advanced</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Preparation (minutes)
              </label>
              <input
                className={fieldCls}
                type="number"
                min="0"
                value={prep}
                onChange={(e) => setPrep(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Cooking (minutes)
              </label>
              <input
                className={fieldCls}
                type="number"
                min="0"
                value={cook}
                onChange={(e) => setCook(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Ingredients
            </label>
            <textarea
              className={fieldCls}
              rows={5}
              placeholder={"Example:\n200g flour\n2 eggs\n100ml milk"}
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Write one ingredient per line, including its quantity.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Tools & Equipment
            </label>
            <textarea
              className={fieldCls}
              rows={3}
              placeholder={"Example:\nMixing bowl\nWhisk\nFrying pan"}
              value={tools}
              onChange={(e) => setTools(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Cooking Instructions
            </label>
            <textarea
              className={fieldCls}
              rows={6}
              placeholder={"Example:\nPrepare all ingredients.\nMix everything together.\nCook until ready."}
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Write one step per line, in the correct order.
            </p>
          </div>

          <Button
            type="submit"
            disabled={saving || !title.trim()}
            className="w-full rounded-full"
          >
            <BookOpen className="mr-2 size-4" />
            {saving ? "Saving..." : "Save Recipe"}
          </Button>
        </form>
      )}

      {/* SEARCH */}
      {!selected && (
        <div className="relative mb-5">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className={`${fieldCls} pl-10`}
            placeholder="Search your recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* RECIPE DETAIL */}
      {selected ? (
        <div className="space-y-5">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-2 text-sm text-primary"
          >
            <ArrowLeft className="size-4" />
            Back to recipes
          </button>

          <div className="rounded-2xl bg-gradient-to-br from-violet-500/15 via-pink-400/10 to-amber-300/15 p-5">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              {selected.category}
            </span>

            <h3 className="mt-2 text-3xl font-semibold">
              {selected.title}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              {selected.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <span>◷ Prep: {selected.prep_minutes} min</span>
              <span>♨ Cook: {selected.cook_minutes} min</span>
              <span>✧ {selected.difficulty}</span>
            </div>
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2 font-semibold">
              <Utensils className="size-4 text-primary" />
              Ingredients
            </h4>
            <ul className="space-y-2">
              {selected.ingredients.map((item, i) => (
                <li key={i} className="rounded-xl bg-secondary/60 p-3 text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2 font-semibold">
              <CookingPot className="size-4 text-primary" />
              Tools & Equipment
            </h4>
            <ul className="flex flex-wrap gap-2">
              {selected.tools.map((item, i) => (
                <li
                  key={i}
                  className="rounded-full border border-border px-3 py-2 text-sm"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2 font-semibold">
              <BookOpen className="size-4 text-primary" />
              Instructions
            </h4>
            <div className="space-y-3">
              {selected.steps.map((step, i) => (
                <div key={i} className="flex gap-3 rounded-xl bg-secondary/50 p-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full rounded-full text-destructive"
            onClick={() => deleteRecipe(selected)}
          >
            <Trash2 className="mr-2 size-4" />
            Delete Recipe
          </Button>
        </div>
      ) : loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Preparing your recipe collection...
        </p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <ChefHat className="mx-auto mb-3 size-9 text-primary" />
          <h3 className="font-semibold">
            {search ? "No recipes found" : "Your cookbook is waiting"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? "Try another search."
              : "Save your first recipe and keep it here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => setSelected(recipe)}
              className="group rounded-2xl border border-border bg-background/60 p-4 text-left transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-300/30 to-violet-400/30">
                <ChefHat className="size-6 text-primary" />
              </div>

              <span className="text-xs font-medium text-primary">
                {recipe.category}
              </span>

              <h3 className="mt-1 font-semibold">
                {recipe.title}
              </h3>

              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {recipe.description || "A recipe saved in your cookbook."}
              </p>

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {recipe.prep_minutes + recipe.cook_minutes} min
                </span>
                <span>{recipe.difficulty}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 text-center text-xs text-muted-foreground">
        ✧ Every recipe holds a little memory. ✧
      </div>
    </section>
  );
}
