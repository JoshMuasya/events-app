import CheckIn from '@/app/components/CheckIn/CheckIn'
import React from 'react'

const page = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F7E7CE] via-[#FFD700] to-[#E5C07B] overflow-hidden px-4 pt-20">
      <CheckIn />
    </div>
  )
}

export default page
