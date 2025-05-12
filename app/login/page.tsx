import React from 'react'
import { signInWIthGoogle } from '../actions'

const Login = () => {
  return (
    <div>
        <button className='p-5 text-2xl font-bold border-2 border-gray-400 cursor-pointer' onClick={signInWIthGoogle}>signin</button>
    </div>
  )
}

export default Login