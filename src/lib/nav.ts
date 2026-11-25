import {
  Archive, BookHeart, CalendarDays, CalendarRange, CloudSun, Compass, Flower2, Gamepad2,
  Home, ImagePlus, LayoutDashboard, LockKeyhole, Settings2, Sparkles, Sprout, Sun,
} from "lucide-react";
import type { ElementType } from "react";

export type NavItem = { label: string; to: string; icon: ElementType; group: string; blurb: string };

export const NAV: NavItem[] = [
  { label: "Home", to: "/home", icon: Home, group: "YOUR UNIVERSE", blurb: "A new little chapter is waiting for you." },
  { label: "Daily World", to: "/daily", icon: Sun, group: "YOUR UNIVERSE", blurb: "Make room for the little things that matter." },
  { label: "Workspace", to: "/workspace", icon: LayoutDashboard, group: "YOUR UNIVERSE", blurb: "Your projects, plans, and ideas live here." },
  { label: "Calendar", to: "/calendar", icon: CalendarRange, group: "YOUR UNIVERSE", blurb: "Every lovely day, mapped out softly." },
  { label: "Arcade", to: "/arcade", icon: Gamepad2, group: "DISCOVER", blurb: "A tiny corner for play and little challenges." },
  { label: "Explore", to: "/explore", icon: Compass, group: "DISCOVER", blurb: "Collect interesting corners of the internet." },
  { label: "World Weather", to: "/weather", icon: CloudSun, group: "DISCOVER", blurb: "A little window to places around the world." },
  { label: "Randomizer", to: "/randomizer", icon: Sparkles, group: "DISCOVER", blurb: "Let a little magic make the choice." },
  { label: "Knowledge Garden", to: "/knowledge", icon: Sprout, group: "PERSONAL", blurb: "Plant a thought. Grow a whole library." },
  { label: "Memories", to: "/memories", icon: ImagePlus, group: "PERSONAL", blurb: "Keep the moments you want to revisit." },
  { label: "My Diary", to: "/diary", icon: BookHeart, group: "PERSONAL", blurb: "A quiet space for your thoughts." },
  { label: "My Vault", to: "/vault", icon: LockKeyhole, group: "PERSONAL", blurb: "Your private home for important files." },
  { label: "Collections", to: "/collections", icon: Archive, group: "PERSONAL", blurb: "All your favorite things, gathered together." },
  { label: "My Garden", to: "/garden", icon: Flower2, group: "PERSONAL", blurb: "Small steps help lovely things grow." },
];
export const SETTINGS: NavItem = { label: "Settings", to: "/settings", icon: Settings2, group: "", blurb: "Make Lunaria feel like yours." };
export const GROUPS = ["YOUR UNIVERSE", "DISCOVER", "PERSONAL"] as const;
export const CalendarIcon = CalendarDays;

export const FILE_CATEGORIES = ["Memories", "Music", "Videos", "Documents", "My Vault", "Knowledge", "Workspace"] as const;
