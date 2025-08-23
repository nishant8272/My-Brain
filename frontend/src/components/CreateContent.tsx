import React, { useState } from 'react'

export function CreateContent({open}) {
    const [modelOpen,setModelOpen] =useState()

  return (
    <div>

    {open && <div className='w-screen h-screen opacity-60 bg-slate-500 fixed top-0 left-0 flex justify-center '>
        <div className='flex  flex-col justify-center'>
            <span className='bg-white opacity-100 p-4 rounded-lg'>
                hii there 
            </span>
        </div>
    </div>}
    </div>
  )
}
