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
    border: '1px solid #E8E4DE', borderRadius: '12px',
    fontSize: '15px', boxSizing: 'border-box', outline: 'none',
    background: '#FAFAF8', color: '#1B2D4F',
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  }
  const fh = {
    onFocus: e => { e.target.style.borderColor = '#7BC4C4'; e.target.style.boxShadow = '0 0 0 3px rgba(123,196,196,0.1)'; e.target.style.background = '#FFFFFF'; },
    onBlur: e => { e.target.style.borderColor = '#E8E4DE'; e.target.style.boxShadow = 'none'; e.target.style.background = '#FAFAF8'; },
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
      <style>{`@media(max-width:540px){.auth-card{margin:16px!important;padding:40px 28px 36px!important;}}`}</style>

      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(155deg, #B8D8C0 0%, #96CABA 30%, #7EC4C0 60%, #6EBCBC 100%)',
        position: 'relative', overflow: 'hidden', padding: '24px 16px',
      }}>
        {/* Background glows */}
        <div style={{ position:'absolute', top:'-5%', left:'-5%', width:'55vw', height:'55vw', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 60%)', filter:'blur(60px)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'-8%', right:'-8%', width:'50vw', height:'50vw', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 55%)', filter:'blur(60px)', pointerEvents:'none' }}/>

        {/* ── Single card ── */}
        <div className="auth-card" style={{
          background: '#FBFBFA', borderRadius: 22,
          padding: '56px 48px 48px',
          boxShadow: '0 8px 40px rgba(27,45,79,0.08), 0 1px 3px rgba(27,45,79,0.04)',
          width: '100%', maxWidth: 460, position: 'relative', zIndex: 1,
        }}>
          {/* Logo */}
          <img src="/logo.png" alt="SupTrack" style={{
            width: 260, display: 'block', margin: '0 auto 8px',
          }}/>

          {/* Tagline */}
          <p style={{
            fontFamily: "'Lora', Georgia, serif", fontStyle: 'italic', fontWeight: 400,
            fontSize: 22, color: '#5A9E98', margin: '0 0 28px', textAlign: 'center',
            letterSpacing: '0.01em',
          }}>
            Supervision, simplified.
          </p>

          {/* Divider */}
          <div style={{ height: 1, background: '#EAE6E0', margin: '0 0 28px' }}/>

          {/* Heading */}
          <h1 style={{
            fontFamily: "'Lora', Georgia, serif", fontSize: 26, fontWeight: 600,
            color: '#1B2D4F', margin: '0 0 6px', textAlign: 'center',
          }}>
            {isInternInvite ? 'Intern Portal' : isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p style={{
            fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 13,
            color: '#94A09A', margin: '0 0 24px', textAlign: 'center',
          }}>
            {isInternInvite ? 'Your supervisor invited you.' : isSignUp ? 'Start your 14-day free trial.' : 'Sign in to continue.'}
          </p>

          {/* Form */}
          <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>

          {isInternInvite && (
            <div style={{
              background: '#EFF8F6', border: '1px solid #D0E8E4', borderRadius: 10,
              padding: '12px 14px', marginBottom: 16, fontSize: 13,
              color: '#1B2D4F', lineHeight: 1.6, fontFamily: "'DM Sans', system-ui, sans-serif",
            }}>
              Create an account to view your hours, notes, and documents.
            </div>
          )}

          {isSignUp && <input type="text" name="name" autoComplete="name" placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)} style={inp} {...fh}/>}
          <input type="email" name="email" autoComplete="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={inp} {...fh}/>
          <input type="password" name="password" autoComplete={isSignUp?"new-password":"current-password"} placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={inp} {...fh}/>
          {isSignUp && !isInternInvite && <input type="text" name="invite-code" autoComplete="off" placeholder="Invite code" value={inviteCode} onChange={e=>setInviteCode(e.target.value)} style={{...inp, marginBottom: 20}} {...fh}/>}

          {message && (
            <p style={{ color: isError ? '#B84040' : '#2E7A4E', margin: '0 0 14px', fontSize: 13,
              textAlign: 'center', lineHeight: 1.5, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
              {message}
            </p>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: 15, border: 'none', borderRadius: 12,
            fontSize: 15, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
            transition: 'all 0.2s', fontFamily: "'DM Sans', system-ui, sans-serif",
            background: '#3A9E9E', color: 'white',
            boxShadow: '0 4px 16px rgba(58,158,158,0.25)',
            opacity: loading ? 0.65 : 1,
          }}>
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
          </form>

          {/* Toggle */}
          <p style={{ textAlign: 'center', fontSize: 13, color: '#94A09A', margin: '18px 0 0',
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
        </div>

        {/* Copyright */}
        <p style={{ marginTop: 24, fontSize: 11, color: 'rgba(255,255,255,0.4)',
          fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: '0.04em' }}>
          &copy; {new Date().getFullYear()} SupTrack
        </p>
      </div>
    </>
  )
}
