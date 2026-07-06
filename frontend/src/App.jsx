import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn'
import RootLayout from './layout/RootLayout'
import Dashboard from './pages/Dashboard'
import DashboardWorkshop from './pages/DashboardWorkshop'
import Scan from './pages/Scan'


function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<RootLayout />}>
        <Route index element={<Scan />} />
        <Route path='/sign-in' element={<SignIn />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/dashboard/workshop' element={<DashboardWorkshop />} />
      </Route>
    ),{
      basename: import.meta.env.VITE_BASE_URL || ''
    }
  )

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
