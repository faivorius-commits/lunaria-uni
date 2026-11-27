export function pageHead(label: string, blurb: string) {
  const title = `${label} — Lunaria`;
  return () => ({ meta: [
    { title }, { name: "description", content: blurb },
    { property: "og:title", content: title }, { property: "og:description", content: blurb },
  ] });
}
