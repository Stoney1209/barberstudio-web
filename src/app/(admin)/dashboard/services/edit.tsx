"use client";
import React, { useState } from 'react'
import { default as Button } from '@/components/ui/Button'

type Service = { id: string; name: string; price: number; duration: number; category: string }

const AdminServiceEditor: React.FC<{ service: Service }> = ({ service }) => {
  const [name, setName] = useState(service.name)
  const [price, setPrice] = useState<number>(service.price)
  const [duration, setDuration] = useState<number>(service.duration)
  const [category, setCategory] = useState<string>(service.category)

  const save = async () => {
    await fetch(`/api/services/${service.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, duration, category, imageUrl: '' }),
    })
  }

  return (
    <div className="p-2 border border-[#2a2a2a] rounded">
      <input className="bg-[#1e1e1e] p-1 rounded mr-2" value={name} onChange={(e)=>setName(e.target.value)} />
      <input className="bg-[#1e1e1e] p-1 rounded mr-2" value={price} onChange={(e)=>setPrice(parseFloat(e.target.value))} />
      <input className="bg-[#1e1e1e] p-1 rounded" value={duration} onChange={(e)=>setDuration(parseInt(e.target.value))} />
      <select className="bg-[#1e1e1e] p-1 rounded" value={category} onChange={(e)=>setCategory(e.target.value)}>
        <option value="CLASSIC">CLASSIC</option>
        <option value="FADE">FADE</option>
        <option value="BEARD">BEARD</option>
      </select>
      <Button onClick={save} ariaLabel={`Guardar ${service.name}`}>Guardar</Button>
    </div>
  )
}

export default AdminServiceEditor
