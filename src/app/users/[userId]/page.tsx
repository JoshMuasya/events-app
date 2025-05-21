import UserDetails from '@/app/components/UserDetails'
import React from 'react'

const page = ({ params }: { params: { userId: string } }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F7E7CE] via-[#FFD700] to-[#E5C07B] overflow-hidden px-4">
      <UserDetails userId={params.userId} />
    </div>
  )
}

export default page
