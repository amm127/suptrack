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
    width: '100%', padding: '13px 16px', marginBottom: '14px',
    border: '1px solid #E2E8F0', borderRadius: '10px',
    fontSize: '15px', boxSizing: 'border-box', outline: 'none',
    background: '#FFFFFF', color: '#1B2D4F',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  const focusHandlers = {
    onFocus: e => { e.target.style.borderColor = '#4ABFBF'; e.target.style.boxShadow = '0 0 0 3px rgba(74,191,191,0.12)'; },
    onBlur: e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; },
  }

  return (
    <>
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
          flex: '0 0 44%', background: 'linear-gradient(170deg, #C8DFC4 0%, #A8D0B8 30%, #8AC8C0 60%, #7BC4C4 100%)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '60px 48px', position: 'relative', overflow: 'hidden',
        }}>
          {/* Soft organic shapes */}
          <div style={{ position: 'absolute', top: '-10%', right: '-15%', width: '50%', height: '50%', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }}/>
          <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '45%', height: '45%', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }}/>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 320, textAlign: 'center' }}>
            <img src="/logo.png" alt="SupTrack" style={{ width: 220, display: 'block', margin: '0 auto 16px' }}/>
            <p style={{ color: '#1B2D4F', fontSize: 17, fontWeight: 400, fontStyle: 'italic', margin: '0 0 40px', letterSpacing: '0.02em', opacity: 0.8 }}>
              Supervision, simplified.
            </p>

            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                ['Track hours with confidence', 'Audit-ready logs that match your licensing board requirements.'],
                ['AI-powered session notes', 'Log sessions in seconds with intelligent note generation.'],
                ['Everything in one place', 'Hours, documents, payments, agreements, and intern portals.'],
              ].map(([title, desc]) => (
                <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B2D4F', marginTop: 6, flexShrink: 0, opacity: 0.5 }}/>
                  <div>
                    <div style={{ color: '#1B2D4F', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{title}</div>
                    <div style={{ color: '#2A4A3A', fontSize: 13, lineHeight: 1.5, opacity: 0.7 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: 28, fontSize: 12, color: 'rgba(27,45,79,0.3)' }}>
            &copy; {new Date().getFullYear()} SupTrack
          </div>
        </div>

        {/* ── Right: Form panel ── */}
        <div className="auth-form" style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '48px 40px', background: '#FAFBFC',
        }}>
          <div style={{ width: '100%', maxWidth: 380 }}>

            {/* Mobile-only logo */}
            <div className="auth-mobile-logo" style={{ display: 'none' }}>
              <img src="/logo.png" alt="SupTrack" style={{ width: 160, display: 'block', margin: '0 auto 24px' }}/>
            </div>
            <style>{`@media (max-width: 768px) { .auth-mobile-logo { display: block !important; } }`}</style>

            <h1 style={{ fontSize: 24, fontWeight: 600, color: '#1B2D4F', margin: '0 0 6px' }}>
              {isInternInvite ? 'Intern Portal' : isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p style={{ fontSize: 14, color: '#6B7A8D', margin: '0 0 28px' }}>
              {isInternInvite
                ? 'Your supervisor invited you to access your portal.'
                : isSignUp ? 'Start your 14-day free trial.' : 'Sign in to your account.'}
            </p>

            {isInternInvite && (
              <div style={{
                background: '#EFF8F8', border: '1px solid #C8E8E8', borderRadius: 10,
                padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#1B2D4F', lineHeight: 1.6,
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
                style={{ ...inputStyle, marginBottom: 20 }} {...focusHandlers}/>
            )}

            {message && (
              <p style={{ color: isError ? '#C0392B' : '#2E7A4E', margin: '0 0 14px', fontSize: 14, textAlign: 'center', lineHeight: 1.5 }}>
                {message}
              </p>
            )}

            <button onClick={handleSubmit} disabled={loading}
              style={{
                width: '100%', padding: 14, border: 'none', borderRadius: 12,
                fontSize: 15, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
                marginBottom: 18, transition: 'opacity 0.2s', letterSpacing: '0.01em',
                background: 'linear-gradient(135deg, #1B2D4F 0%, #2A5A6A 50%, #3A9E9E 100%)',
                color: 'white', boxShadow: '0 4px 16px rgba(27,45,79,0.18)',
                opacity: loading ? 0.7 : 1,
              }}>
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>

            {!isInternInvite && (
              <p style={{ textAlign: 'center', fontSize: 14, color: '#6B7A8D', margin: 0 }}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <span onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
                  style={{ color: '#2A6B7A', cursor: 'pointer', fontWeight: 600 }}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </span>
              </p>
            )}

            {isInternInvite && !isSignUp && (
              <p style={{ textAlign: 'center', fontSize: 14, color: '#6B7A8D', margin: 0 }}>
                Don't have an account?{' '}
                <span onClick={() => { setIsSignUp(true); setMessage('') }}
                  style={{ color: '#1B2D4F', cursor: 'pointer', fontWeight: 600 }}>Create one</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
