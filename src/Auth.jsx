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
        const isLifetimeFree = LIFETIME_FREE_CODES.includes(inviteCode.trim())
        if (!isLifetimeFree) {
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
          if (!isLifetimeFree) {
            await supabase.from('invites').update({ used: true }).eq('code', inviteCode.trim())
          }
          if (isLifetimeFree && signUpData?.user) {
            await supabase.from('supervisors').upsert({
              user_id: signUpData.user.id, name: fullName.trim() || email, email,
              plan: 'starter', trial_ends_at: null, lifetime_free: true,
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
    width: '100%', padding: '14px 18px', marginBottom: '16px',
    border: '1px solid #DDD8D0', borderRadius: '12px',
    fontSize: '15px', boxSizing: 'border-box', outline: 'none',
    background: '#FFFEFB', color: '#1B2D4F',
    transition: 'border-color 0.25s, box-shadow 0.25s',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  }

  const focusHandlers = {
    onFocus: e => { e.target.style.borderColor = '#7BC4C4'; e.target.style.boxShadow = '0 0 0 4px rgba(123,196,196,0.12)'; },
    onBlur: e => { e.target.style.borderColor = '#DDD8D0'; e.target.style.boxShadow = 'none'; },
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
      <style>{`
        @media (max-width: 768px) {
          .auth-split { flex-direction: column !important; }
          .auth-brand { display: none !important; }
          .auth-form { min-height: 100vh !important; width: 100% !important; }
        }
      `}</style>

      <div className="auth-split" style={{ display: 'flex', minHeight: '100vh' }}>

        {/* ── Left: Brand panel ── */}
        <div className="auth-brand" style={{
          flex: '0 0 46%',
          background: 'linear-gradient(165deg, #D2E8CE 0%, #B8D8C4 20%, #9ECEBE 45%, #88C8C0 70%, #78C2C2 100%)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '60px 56px', position: 'relative', overflow: 'hidden',
        }}>
          {/* Radial glow behind logo */}
          <div style={{ position: 'absolute', top: '25%', left: '50%', transform: 'translate(-50%,-50%)',
            width: '70%', height: '50%', borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 50%, transparent 75%)',
            pointerEvents: 'none', filter: 'blur(20px)',
          }}/>
          {/* Soft top-right glow */}
          <div style={{ position: 'absolute', top: '-8%', right: '-12%', width: '45%', height: '45%', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }}/>
          {/* Soft bottom-left glow */}
          <div style={{ position: 'absolute', bottom: '-5%', left: '-8%', width: '40%', height: '40%', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }}/>

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 380 }}>
            <img src="/logo.png" alt="SupTrack" style={{
              width: '380px', minWidth: '380px', maxWidth: '380px',
              display: 'block', margin: '0 auto 24px',
              filter: 'drop-shadow(0 4px 20px rgba(27,45,79,0.08))',
            }}/>
            <p style={{
              fontFamily: "'Lora', Georgia, serif", color: '#1B2D4F',
              fontSize: 22, fontWeight: 400, fontStyle: 'italic',
              margin: '0 0 16px', letterSpacing: '0.01em', lineHeight: 1.4,
            }}>
              Supervision, simplified.
            </p>
            <p style={{
              fontFamily: "'DM Sans', system-ui, sans-serif", color: '#2A4A3A',
              fontSize: 14, fontWeight: 400, margin: 0, opacity: 0.6, letterSpacing: '0.02em',
            }}>
              Built by supervisors, for supervisors.
            </p>
          </div>

          <div style={{ position: 'absolute', bottom: 32, fontSize: 11, color: 'rgba(27,45,79,0.25)',
            fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: '0.04em' }}>
            &copy; {new Date().getFullYear()} SupTrack
          </div>
        </div>

        {/* ── Right: Form panel ── */}
        <div className="auth-form" style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '56px 48px', background: '#FAF8F5', position: 'relative',
        }}>
          <div style={{ width: '100%', maxWidth: 380 }}>

            {/* Mobile-only logo */}
            <div className="auth-mobile-logo" style={{ display: 'none' }}>
              <img src="/logo.png" alt="SupTrack" style={{ width: 200, display: 'block', margin: '0 auto 8px' }}/>
              <p style={{ fontFamily: "'Lora', Georgia, serif", fontStyle: 'italic', fontSize: 15,
                color: '#5A7B6E', textAlign: 'center', margin: '0 0 32px' }}>Supervision, simplified.</p>
            </div>
            <style>{`@media (max-width: 768px) { .auth-mobile-logo { display: block !important; } }`}</style>

            <h1 style={{
              fontFamily: "'Lora', Georgia, serif", fontSize: 28, fontWeight: 500,
              color: '#1B2D4F', margin: '0 0 6px', letterSpacing: '-0.01em',
            }}>
              {isInternInvite ? 'Intern Portal' : isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 14, color: '#8A9488', margin: '0 0 32px', lineHeight: 1.5,
            }}>
              {isInternInvite
                ? 'Your supervisor invited you to access your portal.'
                : isSignUp ? 'Start your 14-day free trial.' : 'Sign in to continue.'}
            </p>

            <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>

            {isInternInvite && (
              <div style={{
                background: 'rgba(123,196,196,0.08)', border: '1px solid rgba(123,196,196,0.2)', borderRadius: 12,
                padding: '14px 16px', marginBottom: 18, fontSize: 13, color: '#1B2D4F', lineHeight: 1.6,
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}>
                Create an account to view your hours, session notes, and documents.
              </div>
            )}

            {isSignUp && (
              <input type="text" placeholder="Full name" value={fullName}
                onChange={e => setFullName(e.target.value)} style={inputStyle} {...focusHandlers}/>
            )}
            <input type="email" placeholder="Email" value={email}
              onChange={e => setEmail(e.target.value)} style={inputStyle} {...focusHandlers}/>
            <input type="password" placeholder="Password" value={password}
              onChange={e => setPassword(e.target.value)} style={inputStyle} {...focusHandlers}/>

            {isSignUp && !isInternInvite && (
              <input type="text" placeholder="Invite code" value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                style={{ ...inputStyle, marginBottom: 22 }} {...focusHandlers}/>
            )}

            {message && (
              <p style={{ color: isError ? '#B84040' : '#2E7A4E', margin: '0 0 16px', fontSize: 14,
                textAlign: 'center', lineHeight: 1.5, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                {message}
              </p>
            )}

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: 15, border: 'none', borderRadius: 14,
                fontSize: 15, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
                marginBottom: 20, transition: 'all 0.25s', letterSpacing: '0.01em',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                background: 'linear-gradient(135deg, #3A8E8E 0%, #4ABFBF 50%, #5CC8A8 100%)',
                color: 'white',
                boxShadow: '0 6px 24px rgba(58,142,142,0.25), 0 2px 6px rgba(58,142,142,0.12)',
                opacity: loading ? 0.7 : 1,
              }}>
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
            </form>

            {!isInternInvite && (
              <p style={{ textAlign: 'center', fontSize: 14, color: '#8A9488', margin: '0 0 0',
                fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <span onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
                  style={{ color: '#3A8E8E', cursor: 'pointer', fontWeight: 600 }}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </span>
              </p>
            )}

            {isInternInvite && !isSignUp && (
              <p style={{ textAlign: 'center', fontSize: 14, color: '#8A9488', margin: 0,
                fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                Don't have an account?{' '}
                <span onClick={() => { setIsSignUp(true); setMessage('') }}
                  style={{ color: '#1B2D4F', cursor: 'pointer', fontWeight: 600 }}>Create one</span>
              </p>
            )}

            {/* Trust signal */}
            <div style={{ marginTop: 40, textAlign: 'center' }}>
              <div style={{ width: 40, height: 1, background: '#DDD8D0', margin: '0 auto 16px' }}/>
              <p style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: 12, color: '#B0A898', margin: 0, letterSpacing: '0.03em',
              }}>
                Trusted by clinical supervisors across the country
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
