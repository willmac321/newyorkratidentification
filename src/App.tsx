import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import InspectionMap from './pages/InspectionMap'
import RatClickEffect from './components/RatClickEffect'
import './App.css'

function App() {
  return (
    <Router>
      <RatClickEffect />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<InspectionMap />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
