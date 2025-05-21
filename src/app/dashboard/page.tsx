import React from 'react'
import TopNavbar from '../components/TopNavbar'
import SideBar from '../components/SideBar'
import Dashboard from '../components/Dashboard'

const page = () => {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F7E7CE] via-[#FFD700] to-[#E5C07B] overflow-hidden px-4'>
      <TopNavbar />
      <SideBar />
      <Dashboard />
    </div>
  )
}

export default page
