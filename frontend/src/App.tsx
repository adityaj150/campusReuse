import './App.css'
import Header from './components/Header'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <div className="min-h-screen bg-surface text-text dark:bg-darkSurface dark:text-darkText">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <AppRoutes />
      </main>
    </div>
  )
}

export default App
