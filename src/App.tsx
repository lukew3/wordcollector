import { BrowserRouter as Router } from 'react-router-dom'
import AppContent from './components/AppContent/AppContent'
import './App.css'

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App