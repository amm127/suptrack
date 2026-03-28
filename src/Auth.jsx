import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [fullName, setFullName] = useState('')
  const [isInternInvite, setIsInternInvite] = useState(false)
  const [internInviteToken, setInternInviteToken] = useState('')

  // Check URL for intern invite token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const invite = params.get('invite')
    const type = params.get('type')
    if (invite && type === 'intern') {
      setIsInternInvite(true)
      setInternInviteToken(invite)
      setIsSignUp(true)
      setInviteCode(invite)
    }
  }, [])

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')
    setIsError(false)

    if (isSignUp) {
      if (isInternInvite) {
        // Intern portal signup — validate the intern invite token
        const { data: invite, error: inviteError } = await supabase
          .from('invites')
          .select('*')
          .eq('code', internInviteToken)
          .eq('used', false)
          .eq('type', 'intern_portal')
          .single()

        if (inviteError || !invite) {
          setMessage('Invalid or expired invite link. Please ask your supervisor for a new one.')
          setIsError(true)
          setLoading(false)
          return
        }

        // Create the intern's auth account
        const { data: signUpData, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName.trim() } } })
        if (error) {
          setMessage(error.message)
          setIsError(true)
          setLoading(false)
          return
        }

        // Mark invite as used and link the auth user to the intern record
        await supabase.from('invites').update({ used: true }).eq('code', internInviteToken)

        if (signUpData?.user) {
          // Update the intern record with the auth user_id so we can identify them on login
          await supabase
            .from('interns')
            .update({ portal_user_id: signUpData.user.id, portal_email: email })
            .eq('id', invite.intern_id)
        }

        // Clean up the URL
        window.history.replaceState({}, '', window.location.pathname)
        setMessage('Account created! Check your email to confirm, then sign in.')
      } else {
        // Supervisor signup — check invite code
        const { data: invite, error: inviteError } = await supabase
          .from('invites')
          .select('*')
          .eq('code', inviteCode.trim())
          .eq('used', false)
          .single()

        if (inviteError || !invite || invite.type === 'intern_portal') {
          setMessage('Invalid or already used invite code.')
          setIsError(true)
          setLoading(false)
          return
        }

        const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName.trim() } } })
        if (error) {
          setMessage(error.message)
          setIsError(true)
        } else {
          // Mark invite code as used
          await supabase.from('invites').update({ used: true }).eq('code', inviteCode.trim())
          setMessage('Check your email to confirm your account!')
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage(error.message)
        setIsError(true)
      }
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
        <img src="/logo.png" alt="SupTrack" style={{ width: 120, display: 'block', margin: '0 auto 8px' }} />
        <p style={{ color: '#9B9389', fontSize: '16px', fontWeight: 300, fontStyle: 'italic', textAlign: 'center', marginBottom: '24px' }}>Supervision, simplified.</p>
        <p style={{ color: '#7A7268', marginBottom: '32px' }}>
          {isInternInvite
            ? 'Create your intern portal account'
            : isSignUp ? 'Create your account' : 'Sign in to your account'}
        </p>

        {isInternInvite && (
          <div style={{
            background: '#EEF2FA', border: '1px solid #C8D6EF', borderRadius: '8px',
            padding: '12px 14px', marginBottom: '16px', fontSize: '13px', color: '#3D5A7A', lineHeight: 1.6
          }}>
            Your supervisor has invited you to access your supervision portal. Create an account to view your hours, session notes, and documents.
          </div>
        )}

        {isSignUp && (
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            style={{
              width: '100%', padding: '12px', marginBottom: '12px',
              border: '1px solid #E2DDD8', borderRadius: '8px',
              fontSize: '15px', boxSizing: 'border-box'
            }}
          />
        )}

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
            width: '100%', padding: '12px', marginBottom: '12px',
            border: '1px solid #E2DDD8', borderRadius: '8px',
            fontSize: '15px', boxSizing: 'border-box'
          }}
        />

        {isSignUp && !isInternInvite && (
          <input
            type="text"
            placeholder="Invite code"
            value={inviteCode}
            onChange={e => setInviteCode(e.target.value)}
            style={{
              width: '100%', padding: '12px', marginBottom: '20px',
              border: '1px solid #E2DDD8', borderRadius: '8px',
              fontSize: '15px', boxSizing: 'border-box'
            }}
          />
        )}

        {!isSignUp && <div style={{ marginBottom: '20px' }} />}

        {message && (
          <p style={{ color: isError ? '#e57373' : '#7B9FD4', marginBottom: '16px', fontSize: '14px' }}>
            {message}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '12px', background: isInternInvite ? '#3D5A7A' : '#7B9FD4',
            color: 'white', border: 'none', borderRadius: '8px',
            fontSize: '15px', cursor: 'pointer', marginBottom: '16px'
          }}
        >
          {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>

        {!isInternInvite && (
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#7A7268' }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <span
              onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
              style={{ color: '#7B9FD4', cursor: 'pointer' }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </span>
          </p>
        )}

        {isInternInvite && !isSignUp && (
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#7A7268' }}>
            Don't have an account?{' '}
            <span
              onClick={() => { setIsSignUp(true); setMessage('') }}
              style={{ color: '#3D5A7A', cursor: 'pointer' }}
            >
              Create one
            </span>
          </p>
        )}
      </div>
    </div>
  )
}
