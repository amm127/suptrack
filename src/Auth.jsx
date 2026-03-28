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

  // Lifetime free codes
  const LIFETIME_FREE_CODES = ['STfree1','STfree2','STfree3','STfree4','STfree5']

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')
    setIsError(false)

    if (isSignUp) {
      if (isInternInvite) {
        const { data: invite, error: inviteError } = await supabase
          .from('invites').select('*').eq('code', internInviteToken).eq('used', false).eq('type', 'intern_portal').single()
        if (inviteError || !invite) {
          setMessage('Invalid or expired invite link. Please ask your supervisor for a new one.')
          setIsError(true); setLoading(false); return
        }
        const { data: signUpData, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName.trim() } } })
        if (error) { setMessage(error.message); setIsError(true); setLoading(false); return }
        await supabase.from('invites').update({ used: true }).eq('code', internInviteToken)
        if (signUpData?.user) {
          await supabase.from('interns').update({ portal_user_id: signUpData.user.id, portal_email: email }).eq('id', invite.intern_id)
        }
        window.history.replaceState({}, '', window.location.pathname)
        setMessage('Account created! Check your email to confirm, then sign in.')
      } else {
        // Check if it's a lifetime free code
        const isLifetimeFree = LIFETIME_FREE_CODES.includes(inviteCode.trim())

        if (!isLifetimeFree) {
          // Normal invite code validation
          const { data: invite, error: inviteError } = await supabase
            .from('invites').select('*').eq('code', inviteCode.trim()).eq('used', false).single()
          if (inviteError || !invite || invite.type === 'intern_portal') {
            setMessage('Invalid or already used invite code.')
            setIsError(true); setLoading(false); return
          }
        }

        const { data: signUpData, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName.trim() } } })
        if (error) {
          setMessage(error.message); setIsError(true)
        } else {
          // Mark invite code as used (for non-lifetime codes)
          if (!isLifetimeFree) {
            await supabase.from('invites').update({ used: true }).eq('code', inviteCode.trim())
          }

          // If lifetime free code, create supervisor record immediately with lifetime_free flag
          if (isLifetimeFree && signUpData?.user) {
            await supabase.from('supervisors').upsert({
              user_id: signUpData.user.id,
              name: fullName.trim() || email,
              email: email,
              plan: 'starter',
              trial_ends_at: null,
              lifetime_free: true,
            }, { onConflict: 'user_id' })
          }

          setMessage('Check your email to confirm your account!')
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setMessage(error.message); setIsError(true) }
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '13px 16px', marginBottom: '14px',
    border: '1px solid rgba(27,45,79,0.15)', borderRadius: '10px',
    fontSize: '15px', boxSizing: 'border-box', outline: 'none',
    background: 'rgba(255,255,255,0.7)', color: '#1B2D4F',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(160deg, #E8F5F0 0%, #D4EDE5 25%, #C5E8E0 50%, #D0E7EC 75%, #E0EEF4 100%)',
    }}>
      {/* Soft organic shapes */}
      <div style={{
        position: 'absolute', top: '-15%', right: '-10%', width: '50vw', height: '50vw',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,191,191,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', bottom: '-20%', left: '-15%', width: '60vw', height: '60vw',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,198,126,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>

      {/* Bottom wave */}
      <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '120px', pointerEvents: 'none' }} viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path d="M0,60 C360,110 720,10 1080,70 C1260,100 1380,50 1440,65 L1440,120 L0,120 Z" fill="rgba(27,45,79,0.04)"/>
        <path d="M0,80 C320,40 640,100 960,60 C1200,30 1360,90 1440,75 L1440,120 L0,120 Z" fill="rgba(74,191,191,0.06)"/>
      </svg>

      {/* Frosted glass card */}
      <div style={{
        background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        padding: '44px 40px 36px', borderRadius: '20px',
        boxShadow: '0 8px 40px rgba(27,45,79,0.08), 0 1px 3px rgba(27,45,79,0.06)',
        border: '1px solid rgba(255,255,255,0.6)',
        width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1,
      }}>
        <img src="/logo.png" alt="SupTrack" style={{ width: 880, maxWidth: '100%', display: 'block', margin: '0 auto 8px' }} />
        <p style={{
          color: '#5A7B6E', fontSize: '14px', fontWeight: 400, fontStyle: 'italic',
          textAlign: 'center', marginBottom: '30px', letterSpacing: '0.02em',
        }}>Supervision, simplified.</p>

        <p style={{
          color: '#1B2D4F', marginBottom: '24px', fontSize: '16px', fontWeight: 500,
          textAlign: 'center',
        }}>
          {isInternInvite
            ? 'Create your intern portal account'
            : isSignUp ? 'Create your account' : 'Sign in to your account'}
        </p>

        {isInternInvite && (
          <div style={{
            background: 'rgba(74,191,191,0.1)', border: '1px solid rgba(74,191,191,0.25)', borderRadius: '10px',
            padding: '12px 14px', marginBottom: '16px', fontSize: '13px', color: '#1B2D4F', lineHeight: 1.6,
          }}>
            Your supervisor has invited you to access your supervision portal. Create an account to view your hours, session notes, and documents.
          </div>
        )}

        {isSignUp && (
          <input type="text" placeholder="Full name" value={fullName}
            onChange={e => setFullName(e.target.value)} style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#4ABFBF'; e.target.style.boxShadow = '0 0 0 3px rgba(74,191,191,0.12)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(27,45,79,0.15)'; e.target.style.boxShadow = 'none'; }}
          />
        )}

        <input type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} style={inputStyle}
          onFocus={e => { e.target.style.borderColor = '#4ABFBF'; e.target.style.boxShadow = '0 0 0 3px rgba(74,191,191,0.12)'; }}
          onBlur={e => { e.target.style.borderColor = 'rgba(27,45,79,0.15)'; e.target.style.boxShadow = 'none'; }}
        />
        <input type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)} style={inputStyle}
          onFocus={e => { e.target.style.borderColor = '#4ABFBF'; e.target.style.boxShadow = '0 0 0 3px rgba(74,191,191,0.12)'; }}
          onBlur={e => { e.target.style.borderColor = 'rgba(27,45,79,0.15)'; e.target.style.boxShadow = 'none'; }}
        />

        {isSignUp && !isInternInvite && (
          <input type="text" placeholder="Invite code" value={inviteCode}
            onChange={e => setInviteCode(e.target.value)}
            style={{ ...inputStyle, marginBottom: '20px' }}
            onFocus={e => { e.target.style.borderColor = '#4ABFBF'; e.target.style.boxShadow = '0 0 0 3px rgba(74,191,191,0.12)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(27,45,79,0.15)'; e.target.style.boxShadow = 'none'; }}
          />
        )}

        {!isSignUp && <div style={{ marginBottom: '20px' }} />}

        {message && (
          <p style={{ color: isError ? '#C0392B' : '#2E7A4E', marginBottom: '16px', fontSize: '14px', textAlign: 'center', lineHeight: 1.5 }}>
            {message}
          </p>
        )}

        <button onClick={handleSubmit} disabled={loading}
          style={{
            width: '100%', padding: '14px', border: 'none', borderRadius: '12px',
            fontSize: '15px', fontWeight: 600, cursor: loading ? 'default' : 'pointer',
            marginBottom: '18px', transition: 'all 0.2s', letterSpacing: '0.01em',
            background: isInternInvite
              ? 'linear-gradient(135deg, #1B2D4F 0%, #2A4A7A 100%)'
              : 'linear-gradient(135deg, #1B2D4F 0%, #3A6B8C 50%, #4ABFBF 100%)',
            backgroundSize: '200% 200%', color: 'white',
            boxShadow: '0 4px 16px rgba(27,45,79,0.2)',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>

        {!isInternInvite && (
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#5A6B7A', margin: 0 }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <span
              onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
              style={{ color: '#2A6B7A', cursor: 'pointer', fontWeight: 500 }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </span>
          </p>
        )}

        {isInternInvite && !isSignUp && (
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#5A6B7A', margin: 0 }}>
            Don't have an account?{' '}
            <span onClick={() => { setIsSignUp(true); setMessage('') }}
              style={{ color: '#1B2D4F', cursor: 'pointer', fontWeight: 500 }}>
              Create one
            </span>
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '24px', fontSize: '12px', color: 'rgba(27,45,79,0.4)',
        textAlign: 'center', position: 'relative', zIndex: 1,
      }}>
        &copy; {new Date().getFullYear()} SupTrack
      </div>
    </div>
  )
}
