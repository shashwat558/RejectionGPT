"use client"
import { Button } from '@/components/ui/button'
import React from 'react'
import { signOut } from '../actions'

const page = () => {
  return (
    <div>
        <Button onClick={signOut} variant={"default"}>Logout</Button>
    </div>
  )
}

export default page