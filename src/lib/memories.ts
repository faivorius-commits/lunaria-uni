export type DatedMemory = { memory_date: string | null; memory_category: string };
export function memoryMonth(file: DatedMemory) {
  return file.memory_date?.slice(0, 7) ?? "undated";
}
export function memoryMatches(file: DatedMemory, year: string, month: string, category: string) {
  return (
    (!year || file.memory_date?.slice(0, 4) === year) &&
    (!month || file.memory_date?.slice(5, 7) === month) &&
    (!category || file.memory_category === category)
  );
}
