type PropertyCardProps = {
  title: string
  category: string
  location: string
  description: string
}

export default function PropertyCard({ title, category, location, description }: PropertyCardProps) {
  return (
    <article className="property-card">
      <div className="property-meta">
        <span>{category}</span>
        <strong>{location}</strong>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button type="button">View details</button>
    </article>
  )
}
