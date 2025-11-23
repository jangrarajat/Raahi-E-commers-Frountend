import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './page/Home'
import ProductPage from './page/ProductPage'
import SingleProduct from './page/SingleProduct'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>



      <Routes>
        <Route path='/' element={<> <Navbar /><Home /> <Footer /></>} />
        <Route path="/product/:id" element={<><Navbar /><ProductPage/></>} />
        <Route path="/product/details/:id" element={<><Navbar /><SingleProduct/></>} />

      </Routes>

    </>
  )
}

export default App
