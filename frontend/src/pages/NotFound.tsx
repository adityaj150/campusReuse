import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="space-y-4">
      <p className="text-sm font-semibold uppercase text-accent dark:text-darkAccent">404</p>
      <h1 className="text-4xl font-semibold text-textHeading dark:text-white">Page not found</h1>
      <p className="max-w-2xl text-text dark:text-darkText">
        The page you requested does not exist in this CampusReuse scaffold.
      </p>
      <Link className="inline-flex rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white dark:bg-darkAccent dark:text-darkSurface" to="/">
        Back home
      </Link>
    </section>
  )
}
