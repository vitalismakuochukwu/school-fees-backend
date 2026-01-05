import React, { useState } from 'react'

const UpdateFee = () => {
  const [amount, setAmount] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Note: You need to create this endpoint in your backend
      const response = await fetch('http://localhost:5000/api/admin/update-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), secret: secretKey })
      })

      const data = await response.json()

      if (response.ok) {
        alert('School Fees updated successfully!')
        setAmount('')
      } else {
        alert(data.message || 'Failed to update fee')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Connection error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Update School Fees</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Amount (₦)</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              placeholder="e.g. 45500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Secret Key</label>
            <input
              type="password"
              required
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              placeholder="Enter secret key"
            />
          </div>
          <button disabled={isLoading} type="submit" className="w-full bg-yellow-600 text-white py-3 rounded-lg font-bold hover:bg-yellow-700 transition">
            {isLoading ? 'Updating...' : 'Update Price'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default UpdateFee