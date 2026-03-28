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
    border: '1px solid rgba(255,255,255,0.35)', borderRadius: '12px',
    fontSize: '15px', boxSizing: 'border-box', outline: 'none',
    background: 'rgba(255,255,255,0.08)', color: '#FFFFFF',
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  }
  const fh = {
    onFocus: e => { e.target.style.borderColor = 'rgba(255,255,255,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.14)'; },
    onBlur: e => { e.target.style.borderColor = 'rgba(255,255,255,0.35)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,0.08)'; },
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
      <style>{`
        .auth-inp::placeholder { color: rgba(255,255,255,0.5); }
        @media(max-width:500px){ .auth-glass{margin:0 16px!important;padding:32px 24px!important;} .auth-logo{width:220px!important;} }
      `}</style>

      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: 'linear-gradient(155deg, #B8D8C0 0%, #96CABA 25%, #7EC4C0 50%, #6EBCBC 75%, #5EB4B4 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background glows */}
        <div style={{ position:'absolute', top:'-10%', left:'-10%', width:'55vw', height:'55vw', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%)', filter:'blur(60px)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'-12%', right:'-8%', width:'50vw', height:'50vw', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 55%)', filter:'blur(60px)', pointerEvents:'none' }}/>

        {/* Logo + Tagline */}
        <div style={{ paddingTop: 48, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <img className="auth-logo" src="/logo.png" alt="SupTrack" style={{
            width: 300, maxWidth: 300, height: 'auto',
            display: 'block', margin: '0 auto 16px',
            filter: 'drop-shadow(0 4px 20px rgba(27,45,79,0.08))',
          }}/>
          <p style={{
            fontFamily: "'Lora', Georgia, serif", fontStyle: 'italic', fontWeight: 400,
            fontSize: 24, color: 'rgba(255,255,255,0.9)', margin: 0,
            letterSpacing: '0.01em', textShadow: '0 1px 8px rgba(27,45,79,0.06)',
          }}>
            Supervision, simplified.
          </p>
        </div>

        {/* Spacer */}
        <div style={{ height: 48 }}/>

        {/* Frosted glass form */}
        <div className="auth-glass" style={{
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 20, padding: '40px 40px 36px',
          border: '1px solid rgba(255,255,255,0.25)',
          width: '100%', maxWidth: 400, position: 'relative', zIndex: 1,
        }}>
          <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>

          {isInternInvite && (
            <div style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13,
              color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, fontFamily: "'DM Sans', system-ui, sans-serif",
            }}>
              Your supervisor invited you. Create an account to view your hours, notes, and documents.
            </div>
          )}

          {isSignUp && <input className="auth-inp" type="text" name="name" autoComplete="name" placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)} style={inp} {...fh}/>}
          <input className="auth-inp" type="email" name="email" autoComplete="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={inp} {...fh}/>
          <input className="auth-inp" type="password" name="password" autoComplete={isSignUp?"new-password":"current-password"} placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={inp} {...fh}/>
          {isSignUp && !isInternInvite && <input className="auth-inp" type="text" name="invite-code" autoComplete="off" placeholder="Invite code" value={inviteCode} onChange={e=>setInviteCode(e.target.value)} style={{...inp, marginBottom: 20}} {...fh}/>}

          {message && (
            <p style={{ color: isError ? '#FFB0B0' : '#B0FFD0', margin: '0 0 14px', fontSize: 13,
              textAlign: 'center', lineHeight: 1.5, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
              {message}
            </p>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: 15, border: 'none', borderRadius: 12,
            fontSize: 15, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
            transition: 'all 0.2s', fontFamily: "'DM Sans', system-ui, sans-serif",
            background: '#FFFFFF', color: '#3A9E9E',
            boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
            opacity: loading ? 0.7 : 1, letterSpacing: '0.01em',
          }}>
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '18px 0 0',
            fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            {isInternInvite && !isSignUp ? <>Don't have an account?{' '}
              <span onClick={()=>{setIsSignUp(true);setMessage('');}} style={{color:'#fff',cursor:'pointer',fontWeight:600}}>Create one</span>
            </> : <>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <span onClick={()=>{setIsSignUp(!isSignUp);setMessage('');}} style={{color:'#fff',cursor:'pointer',fontWeight:600}}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </span>
            </>}
          </p>
        </div>

        {/* Copyright */}
        <p style={{ marginTop: 28, paddingBottom: 16, fontSize: 11, color: 'rgba(255,255,255,0.3)',
          fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: '0.04em', position: 'relative', zIndex: 1 }}>
          &copy; {new Date().getFullYear()} SupTrack
        </p>
      </div>
    </>
  )
}
