import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Check your email to confirm your account!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', background: '#FAF9F8'
    }}>
      <div style={{
        background: 'white', padding: '40px', borderRadius: '12px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px'
      }}>
        <h1 style={{ marginBottom: '8px', fontSize: '24px' }}>SupTrack</h1>
        <p style={{ color: '#7A7268', marginBottom: '32px' }}>
          {isSignUp ? 'Create your account' : 'Sign in to your account'}
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            width: '100%', padding: '12px', marginBottom: '12px',
            border: '1px solid #E2DDD8', borderRadius: '8px',
            fontSize: '15px', boxSizing: 'border-box'
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%', padding: '12px', marginBottom: '20px',
            border: '1px solid #E2DDD8', borderRadius: '8px',
            fontSize: '15px', boxSizing: 'border-box'
          }}
        />

        {message && (
          <p style={{ color: '#7B9FD4', marginBottom: '16px', fontSize: '14px' }}>
            {message}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '12px', background: '#7B9FD4',
            color: 'white', border: 'none', borderRadius: '8px',
            fontSize: '15px', cursor: 'pointer', marginBottom: '16px'
          }}
        >
          {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#7A7268' }}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <span
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ color: '#7B9FD4', cursor: 'pointer' }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  )
}