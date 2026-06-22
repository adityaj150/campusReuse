import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { GooeyInput } from './ui/gooey-input'

type SearchBarProps = {
  onSearch?: (query: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch?.(query.trim())
  }

  useEffect(() => {
    if (query === '') {
      onSearch?.('')
    }
  }, [query, onSearch])

  return (
    <form
      className="flex w-full flex-col gap-3 rounded-xl border border-border bg-surface p-6 shadow-soft dark:border-darkBorder dark:bg-darkSurfaceMuted"
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search campus resources"
    >
      <label htmlFor="search-input" className="text-lg font-semibold text-textHeading dark:text-white">
        Search campus resources
      </label>
      <div className="flex items-center">
        <GooeyInput
          placeholder="Type an item, category, or keyword..."
          value={query}
          onValueChange={setQuery}
          expandedWidth={350}
        />
      </div>
    </form>
  )
}
