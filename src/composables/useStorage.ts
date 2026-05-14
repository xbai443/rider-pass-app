export function useStorage<T>(key: string, fallback: T) {
  function get(): T {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : fallback
    } catch {
      return fallback
    }
  }

  function set(value: T): void {
    localStorage.setItem(key, JSON.stringify(value))
  }

  function remove(): void {
    localStorage.removeItem(key)
  }

  return { get, set, remove }
}