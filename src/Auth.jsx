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
        if (inviteError || !invite) { setMessage('Invalid or expired invite link.'); setIsError(true); setLoading(false); return }
        const { data: signUpData, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName.trim() } } })
        if (error) { setMessage(error.message); setIsError(true); setLoading(false); return }
        await supabase.from('invites').update({ used: true }).eq('code', internInviteToken)
        if (signUpData?.user) await supabase.from('interns').update({ portal_user_id: signUpData.user.id, portal_email: email }).eq('id', invite.intern_id)
        window.history.replaceState({}, '', window.location.pathname)
        setMessage('Account created! Check your email to confirm, then sign in.')
      } else {
        const isLifetimeFree = LIFETIME_FREE_CODES.includes(inviteCode.trim())
        if (!isLifetimeFree) {
          const { data: invite, error: inviteError } = await supabase
            .from('invites').select('*').eq('code', inviteCode.trim()).eq('used', false).single()
          if (inviteError || !invite || invite.type === 'intern_portal') { setMessage('Invalid or already used invite code.'); setIsError(true); setLoading(false); return }
        }
        const { data: signUpData, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName.trim() } } })
        if (error) { setMessage(error.message); setIsError(true) }
        else {
          if (!isLifetimeFree) await supabase.from('invites').update({ used: true }).eq('code', inviteCode.trim())
          if (isLifetimeFree && signUpData?.user) await supabase.from('supervisors').upsert({ user_id: signUpData.user.id, name: fullName.trim() || email, email, plan: 'starter', trial_ends_at: null, lifetime_free: true }, { onConflict: 'user_id' })
          setMessage('Check your email to confirm your account!')
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setMessage(error.message); setIsError(true) }
    }
    setLoading(false)
  }

  const inp = {
    width: '100%', padding: '13px 16px', marginBottom: '14px',
    border: '1px solid #C4B9A8', borderRadius: '10px',
    fontSize: '15px', boxSizing: 'border-box', outline: 'none',
    background: '#FFFEFA', color: '#2D4A3E',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  }
  const fh = {
    onFocus: e => { e.target.style.borderColor = '#6B9080'; e.target.style.boxShadow = '0 0 0 3px rgba(107,144,128,0.1)'; },
    onBlur: e => { e.target.style.borderColor = '#C4B9A8'; e.target.style.boxShadow = 'none'; },
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
      <style>{`
        @media (max-width: 768px) {
          .auth-split { flex-direction: column !important; }
          .auth-left { display: none !important; }
          .auth-right { width: 100% !important; min-height: 100vh !important; }
        }
      `}</style>

      {/* SVG noise filter for linen texture */}
      <svg style={{position:'absolute',width:0,height:0}}>
        <filter id="linen">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>
      </svg>

      <div className="auth-split" style={{ display: 'flex', minHeight: '100vh' }}>

        {/* ── LEFT PANEL ── */}
        <div className="auth-left" style={{
          flex: '0 0 55%', background: '#2D4A3E',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '60px 56px', position: 'relative', overflow: 'hidden',
        }}>
          {/* Linen texture overlay */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.03,
            filter: 'url(#linen)', pointerEvents: 'none',
          }}/>

          {/* Organic botanical circle — muted sage watercolor wash */}
          <div style={{
            position: 'absolute', top: '10%', right: '-12%',
            width: '55%', height: '70%', borderRadius: '50%',
            background: 'radial-gradient(ellipse at 40% 40%, rgba(139,169,139,0.12) 0%, rgba(139,169,139,0.04) 50%, transparent 72%)',
            pointerEvents: 'none',
          }}/>
          <div style={{
            position: 'absolute', bottom: '-5%', left: '-8%',
            width: '45%', height: '55%', borderRadius: '50%',
            background: 'radial-gradient(ellipse at 60% 60%, rgba(169,189,149,0.08) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}/>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 360 }}>
            <img src="/logo.png" alt="SupTrack" style={{
              width: 280, maxWidth: 280, height: 'auto',
              display: 'block', margin: '0 auto 20px',
              filter: 'brightness(1.8) contrast(0.9)',
            }}/>
            <p style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic', fontWeight: 400,
              fontSize: 26, color: '#F5F0E8', margin: '0 0 12px',
              letterSpacing: '0.01em', lineHeight: 1.3,
            }}>
              Supervision, simplified.
            </p>
            <p style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 15, color: '#8BAA8B', margin: 0,
              fontWeight: 400, letterSpacing: '0.02em', lineHeight: 1.5,
            }}>
              Built for the clinicians who guide others.
            </p>
          </div>

          {/* Copyright */}
          <div style={{
            position: 'absolute', bottom: 28,
            fontSize: 11, color: 'rgba(245,240,232,0.2)',
            fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: '0.04em',
          }}>
            &copy; {new Date().getFullYear()} SupTrack
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="auth-right" style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '48px 44px', background: '#FAF7F2',
        }}>
          <div style={{ width: '100%', maxWidth: 380 }}>

            {/* Mobile-only logo */}
            <div className="auth-mobile-logo" style={{ display: 'none' }}>
              <img src="/logo.png" alt="SupTrack" style={{ width: 180, display: 'block', margin: '0 auto 8px' }}/>
              <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic',
                fontSize: 18, color: '#6B9080', textAlign: 'center', margin: '0 0 32px' }}>Supervision, simplified.</p>
            </div>
            <style>{`@media (max-width: 768px) { .auth-mobile-logo { display: block !important; } }`}</style>

            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 30, fontWeight: 500, color: '#2D4A3E',
              margin: '0 0 6px',
            }}>
              {isInternInvite ? 'Intern Portal' : isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 15, color: '#9A9080', margin: '0 0 32px',
            }}>
              {isInternInvite ? 'Your supervisor invited you to access your portal.'
                : isSignUp ? 'Start your 14-day free trial.' : 'Sign in to your account'}
            </p>

            <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>

            {isInternInvite && (
              <div style={{
                background: '#F0EDE6', border: '1px solid #DDD6C8', borderRadius: 10,
                padding: '12px 16px', marginBottom: 18, fontSize: 13,
                color: '#2D4A3E', lineHeight: 1.6, fontFamily: "'DM Sans', system-ui, sans-serif",
              }}>
                Create an account to view your hours, notes, and documents.
              </div>
            )}

            {isSignUp && <input type="text" name="name" autoComplete="name" placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)} style={inp} {...fh}/>}
            <input type="email" name="email" autoComplete="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={inp} {...fh}/>
            <input type="password" name="password" autoComplete={isSignUp?"new-password":"current-password"} placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={inp} {...fh}/>
            {isSignUp && !isInternInvite && <input type="text" name="invite-code" autoComplete="off" placeholder="Invite code" value={inviteCode} onChange={e=>setInviteCode(e.target.value)} style={{...inp, marginBottom: 20}} {...fh}/>}

            {message && (
              <p style={{ color: isError ? '#A0453E' : '#3E7A50', margin: '0 0 14px', fontSize: 14,
                textAlign: 'center', lineHeight: 1.5, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                {message}
              </p>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: 14, border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
              transition: 'opacity 0.2s', fontFamily: "'DM Sans', system-ui, sans-serif",
              background: '#2D4A3E', color: '#F5F0E8',
              letterSpacing: '0.01em', opacity: loading ? 0.6 : 1,
            }}>
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 14, color: '#9A9080', margin: '20px 0 0',
              fontFamily: "'DM Sans', system-ui, sans-serif" }}>
              {isInternInvite && !isSignUp ? <>Don't have an account?{' '}
                <span onClick={()=>{setIsSignUp(true);setMessage('');}} style={{color:'#2D4A3E',cursor:'pointer',fontWeight:600}}>Create one</span>
              </> : <>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <span onClick={()=>{setIsSignUp(!isSignUp);setMessage('');}} style={{color:'#2D4A3E',cursor:'pointer',fontWeight:600}}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </span>
              </>}
            </p>

            {/* Trust line */}
            <p style={{
              textAlign: 'center', fontSize: 12, color: '#C0B8A8', margin: '36px 0 0',
              fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: '0.03em',
            }}>
              Trusted by clinical supervisors across the country
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
