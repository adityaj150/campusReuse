type CategoryNavProps = {
  categories: string[]
  selected: string
  onSelect: (category: string) => void
}

export default function CategoryNav({ categories, selected, onSelect }: CategoryNavProps) {
  return (
    <nav className="overflow-x-auto border-y border-border py-4 dark:border-darkBorder" aria-label="Browse by category">
      <div className="flex gap-3 whitespace-nowrap">
        {categories.map((category) => {
          const active = category === selected
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelect(category)}
              className={`rounded-lg px-4 py-2 text-sm transition ${
                active
                  ? 'bg-accent text-white shadow-soft dark:bg-darkAccent dark:text-darkSurface'
                  : 'bg-surface text-textHeading ring-1 ring-inset ring-border hover:bg-accentSoft hover:text-accent dark:bg-darkSurface dark:text-darkText dark:ring-darkBorder dark:hover:bg-darkAccentSoft dark:hover:text-darkAccent'
              }`}
              aria-pressed={active}
            >
              {category}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
