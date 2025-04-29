import React from 'react'
import Header from '../Header'
import Aside from '../Aside'
import Footer from '../Footer'
import { Outlet } from 'react-router-dom'

function AdminLayout() {
  return (
    <div className="wrapper">
      <Header />
      <Aside />
      <div className="content-wrapper">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

export default AdminLayout
