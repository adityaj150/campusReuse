import { useState } from 'react'
import type { FormEvent } from 'react'

type SearchBarProps = {
  onSearch?: (query: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch?.(query.trim())
  }

  return (
    <form
      className="flex w-full flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-soft dark:border-darkBorder dark:bg-darkSurfaceMuted"
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search campus resources"
    >
      <label htmlFor="search-input" className="text-base font-semibold text-textHeading dark:text-white">
        Search campus resources
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="search-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search items, rooms, or services"
          aria-label="Search query"
          className="min-w-0 flex-1 rounded-lg border border-border bg-white px-4 py-3 text-textHeading shadow-sm outline-none transition placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface dark:border-darkBorder dark:bg-darkSurface dark:text-white dark:placeholder:text-slate-500"
          autoComplete="off"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface dark:bg-darkAccent dark:text-darkSurface dark:hover:bg-emerald-300"
        >
          Search
        </button>
      </div>
    </form>
  )
}
