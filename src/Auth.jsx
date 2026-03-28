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
    width: '100%', padding: '14px 18px', marginBottom: '14px',
    border: '1px solid rgba(27,45,79,0.1)', borderRadius: '14px',
    fontSize: '15px', boxSizing: 'border-box', outline: 'none',
    background: 'rgba(255,255,255,0.6)', color: '#1B2D4F',
    transition: 'border-color 0.25s, box-shadow 0.25s, background 0.25s',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  }
  const fh = {
    onFocus: e => { e.target.style.borderColor = 'rgba(74,191,191,0.5)'; e.target.style.boxShadow = '0 0 0 4px rgba(74,191,191,0.08)'; e.target.style.background = 'rgba(255,255,255,0.85)'; },
    onBlur: e => { e.target.style.borderColor = 'rgba(27,45,79,0.1)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,0.6)'; },
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
      <style>{`
        @media (max-width: 600px) {
          .auth-hero-logo { width: 200px !important; min-width: 200px !important; }
          .auth-card { margin: 0 16px !important; width: calc(100% - 32px) !important; }
        }
      `}</style>

      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: 'linear-gradient(150deg, #C4DDBE 0%, #A8CFBA 18%, #8EC8BF 38%, #7AC4C4 58%, #72BFBF 78%, #6AB8B8 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Soft bokeh / depth layers */}
        <div style={{ position:'absolute', top:'8%', left:'15%', width:'35vw', height:'35vw', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 65%)', filter:'blur(40px)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'5%', right:'10%', width:'30vw', height:'30vw', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)', filter:'blur(50px)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'40%', right:'30%', width:'20vw', height:'20vw', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(74,191,191,0.1) 0%, transparent 70%)', filter:'blur(30px)', pointerEvents:'none' }}/>

        {/* ── Hero: Logo + Tagline ── */}
        <div style={{ paddingTop: '8vh', paddingBottom: 36, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <img className="auth-hero-logo" src="/logo.png" alt="SupTrack" style={{
            width: '320px', minWidth: '320px', maxWidth: '320px',
            display: 'block', margin: '0 auto 16px',
            filter: 'drop-shadow(0 6px 30px rgba(27,45,79,0.1))',
          }}/>
          <p style={{
            fontFamily: "'Lora', Georgia, serif", fontStyle: 'italic', fontWeight: 400,
            fontSize: 21, color: 'rgba(255,255,255,0.88)', margin: '0 0 6px',
            letterSpacing: '0.01em', textShadow: '0 1px 8px rgba(27,45,79,0.06)',
          }}>
            Supervision, simplified.
          </p>
          <p style={{
            fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 13,
            color: 'rgba(255,255,255,0.55)', margin: 0, letterSpacing: '0.03em',
          }}>
            Built by supervisors, for supervisors.
          </p>
        </div>

        {/* ── Frosted glass card ── */}
        <div className="auth-card" style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
          borderRadius: 20, padding: '36px 38px 32px',
          boxShadow: '0 12px 48px rgba(27,45,79,0.1), 0 2px 8px rgba(27,45,79,0.04)',
          border: '1px solid rgba(255,255,255,0.5)',
          width: '100%', maxWidth: 400, position: 'relative', zIndex: 1,
        }}>
          <h1 style={{
            fontFamily: "'Lora', Georgia, serif", fontSize: 24, fontWeight: 500,
            color: '#1B4A4A', margin: '0 0 4px', textAlign: 'center',
          }}>
            {isInternInvite ? 'Intern Portal' : isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p style={{
            fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 13,
            color: '#7A9488', margin: '0 0 26px', textAlign: 'center',
          }}>
            {isInternInvite ? 'Your supervisor invited you.' : isSignUp ? 'Start your 14-day free trial.' : 'Sign in to continue.'}
          </p>

          <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>

          {isInternInvite && (
            <div style={{
              background: 'rgba(123,196,196,0.08)', border: '1px solid rgba(123,196,196,0.18)',
              borderRadius: 12, padding: '12px 14px', marginBottom: 16, fontSize: 13,
              color: '#1B2D4F', lineHeight: 1.6, fontFamily: "'DM Sans', system-ui, sans-serif",
            }}>
              Create an account to view your hours, notes, and documents.
            </div>
          )}

          {isSignUp && <input type="text" placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)} style={inp} {...fh}/>}
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={inp} {...fh}/>
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={inp} {...fh}/>
          {isSignUp && !isInternInvite && <input type="text" placeholder="Invite code" value={inviteCode} onChange={e=>setInviteCode(e.target.value)} style={{...inp, marginBottom: 20}} {...fh}/>}

          {message && (
            <p style={{ color: isError ? '#B84040' : '#2E7A4E', margin: '0 0 14px', fontSize: 13,
              textAlign: 'center', lineHeight: 1.5, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
              {message}
            </p>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: 15, border: 'none', borderRadius: 14,
            fontSize: 15, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
            transition: 'all 0.25s', letterSpacing: '0.01em',
            fontFamily: "'DM Sans', system-ui, sans-serif",
            background: '#3A9E9E', color: 'white',
            boxShadow: '0 4px 18px rgba(58,158,158,0.3)',
            opacity: loading ? 0.65 : 1,
          }}>
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#7A9488', margin: '18px 0 0',
            fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            {isInternInvite && !isSignUp ? <>Don't have an account?{' '}
              <span onClick={()=>{setIsSignUp(true);setMessage('');}} style={{color:'#3A9E9E',cursor:'pointer',fontWeight:600}}>Create one</span>
            </> : <>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <span onClick={()=>{setIsSignUp(!isSignUp);setMessage('');}} style={{color:'#3A9E9E',cursor:'pointer',fontWeight:600}}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </span>
            </>}
          </p>

          {/* Trust signal */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <div style={{ width: 32, height: 1, background: 'rgba(27,45,79,0.08)', margin: '0 auto 10px', borderRadius: 1 }}/>
            <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 11,
              color: '#B0A898', margin: 0, letterSpacing: '0.04em' }}>
              Trusted by clinical supervisors across the country
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ padding: '28px 0 20px', fontSize: 11, color: 'rgba(255,255,255,0.35)',
          fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: '0.04em', position: 'relative', zIndex: 1 }}>
          &copy; {new Date().getFullYear()} SupTrack
        </div>
      </div>
    </>
  )
}
