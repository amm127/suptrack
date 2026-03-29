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

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/fraunces@5/index.css"/>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/dm-serif-display/index.css"/>
      <style>{`
        .st-auth-body { min-height:100vh; background-color:#EEF2F0;
          background-image: radial-gradient(ellipse at 20% 10%, rgba(30,100,100,0.07) 0%, transparent 55%),
                            radial-gradient(ellipse at 80% 90%, rgba(196,160,64,0.06) 0%, transparent 55%);
          display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px 20px;
          font-family:Georgia, serif; }
        .st-auth-body *, .st-auth-body *::before, .st-auth-body *::after { margin:0; padding:0; box-sizing:border-box; }
        .st-sparkle { position:fixed; inset:0; pointer-events:none; overflow:hidden; }
        .st-sp { position:absolute; color:#1E4040; opacity:0.12; animation:st-twinkle 4s ease-in-out infinite; }
        @keyframes st-twinkle { 0%,100%{opacity:0.08;transform:scale(1);} 50%{opacity:0.22;transform:scale(1.2);} }
        @keyframes st-fadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
        .st-auth-inp { width:100%; padding:15px 18px; background:#E8F0EE; border:1.5px solid #C0D0CC; border-radius:12px;
          font-size:15px; font-family:Georgia, serif; color:#102828; outline:none; transition:border-color 0.2s, background 0.2s; box-sizing:border-box; }
        .st-auth-inp:focus { border-color:#1E4040; background:#EEF5F3; }
        .st-auth-inp::placeholder { color:#88A8A4; }
        .st-auth-btn { width:100%; padding:17px; background:#1E4040; color:#C8E8E0; border:none; border-radius:12px;
          font-family:'Fraunces','DM Serif Display',Georgia,serif; font-size:19px; font-weight:700; letter-spacing:0.5px;
          cursor:pointer; transition:background 0.2s, transform 0.1s; }
        .st-auth-btn:hover { background:#102828; transform:translateY(-1px); }
        .st-auth-btn:active { transform:translateY(0); }
        .st-auth-btn:disabled { opacity:0.6; cursor:default; transform:none; }
        @media(max-width:500px){ .st-auth-card{padding:36px 28px 32px!important;} .st-auth-wordmark{font-size:56px!important;} }
      `}</style>

      <div className="st-auth-body">
        {/* Sparkles */}
        <div className="st-sparkle">
          <span className="st-sp" style={{top:'8%',left:'12%',fontSize:14,animationDelay:'0s'}}>✦</span>
          <span className="st-sp" style={{top:'14%',right:'16%',fontSize:10,animationDelay:'1.2s'}}>✦</span>
          <span className="st-sp" style={{top:'73%',left:'8%',fontSize:10,animationDelay:'2s'}}>✦</span>
          <span className="st-sp" style={{top:'80%',right:'12%',fontSize:14,animationDelay:'0.6s'}}>✦</span>
          <span className="st-sp" style={{top:'42%',left:'4%',fontSize:8,animationDelay:'1.8s'}}>✦</span>
          <span className="st-sp" style={{top:'55%',right:'5%',fontSize:8,animationDelay:'0.4s'}}>✦</span>
        </div>

        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:44,animation:'st-fadeUp 0.8s ease both'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:20,marginBottom:2}}>
            <span style={{color:'#1E4040',fontSize:16,opacity:0.4}}>✦</span>
            <span className="st-auth-wordmark" style={{fontFamily:"'Fraunces','DM Serif Display',Georgia,serif",fontSize:78,fontWeight:700,color:'#1E4040',letterSpacing:-2,lineHeight:1}}>SupTrack</span>
            <span style={{color:'#1E4040',fontSize:10,opacity:0.4}}>✦</span>
          </div>
          <div style={{fontFamily:'Georgia, serif',fontSize:13,fontStyle:'italic',color:'#608080',letterSpacing:3.5,marginTop:14}}>
            Supervision, simplified.
          </div>
        </div>

        {/* Card */}
        <div className="st-auth-card" style={{
          background:'#FAFDFB',borderRadius:24,padding:'48px 44px 40px',width:'100%',maxWidth:420,
          boxShadow:'0 8px 48px rgba(30,64,64,0.10), 0 2px 8px rgba(30,64,64,0.06)',
          border:'1px solid #C8D8D4',animation:'st-fadeUp 0.9s ease 0.1s both',
        }}>
          <div style={{fontFamily:"'Fraunces','DM Serif Display',Georgia,serif",fontSize:30,fontWeight:700,color:'#102828',textAlign:'center',marginBottom:6}}>
            {isInternInvite ? 'Intern Portal' : isSignUp ? 'Create account' : 'Welcome back'}
          </div>
          <div style={{fontSize:14,color:'#608080',textAlign:'center',fontStyle:'italic',marginBottom:32,letterSpacing:0.5}}>
            {isInternInvite ? 'Your supervisor invited you.' : isSignUp ? 'Start your 14-day free trial' : 'Sign in to your account'}
          </div>

          <form onSubmit={e=>{e.preventDefault();handleSubmit();}}>
            <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:20}}>

              {isInternInvite && (
                <div style={{background:'#E8F0EE',border:'1px solid #C0D0CC',borderRadius:10,padding:'12px 14px',fontSize:13,color:'#102828',lineHeight:1.6}}>
                  Create an account to view your hours, notes, and documents.
                </div>
              )}

              {isSignUp && <input className="st-auth-inp" type="text" name="name" autoComplete="name" placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)}/>}
              <input className="st-auth-inp" type="email" name="email" autoComplete="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)}/>
              <input className="st-auth-inp" type="password" name="password" autoComplete={isSignUp?'new-password':'current-password'} placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/>
              {isSignUp && !isInternInvite && <input className="st-auth-inp" type="text" name="invite-code" autoComplete="off" placeholder="Invite code" value={inviteCode} onChange={e=>setInviteCode(e.target.value)}/>}
            </div>

            {message && (
              <div style={{textAlign:'center',fontSize:14,color:isError?'#904040':'#2E6848',marginBottom:16,lineHeight:1.5}}>
                {message}
              </div>
            )}

            <button className="st-auth-btn" type="submit" disabled={loading}>
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Forgot password */}
          {!isSignUp&&!isInternInvite&&<div style={{textAlign:'center',margin:'12px 0 0'}}>
            <button onClick={async()=>{
              if(!email.trim()){setMessage('Enter your email above first.');setIsError(true);return;}
              setLoading(true);setMessage('');
              const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin});
              setLoading(false);
              if(error){setMessage(error.message);setIsError(true);}
              else{setMessage('Password reset link sent to your email.');setIsError(false);}
            }} style={{background:'none',border:'none',cursor:'pointer',fontSize:13,color:'#608080',fontFamily:'inherit',textDecoration:'underline'}}>
              Forgot password?
            </button>
          </div>}

          {/* Divider */}
          <div style={{display:'flex',alignItems:'center',gap:12,margin:'18px 0',color:'#C4A040',fontSize:11}}>
            <div style={{flex:1,height:1,background:'#C8D8D4'}}/>
            <span>✦</span>
            <div style={{flex:1,height:1,background:'#C8D8D4'}}/>
          </div>

          {/* Toggle */}
          <div style={{textAlign:'center',fontSize:13,color:'#608080'}}>
            {isInternInvite && !isSignUp
              ? <>Don't have an account?{' '}
                  <span onClick={()=>{setIsSignUp(true);setMessage('');}} style={{color:'#1E4040',fontWeight:700,cursor:'pointer',fontFamily:"'Fraunces',Georgia,serif"}}>Create one</span>
                </>
              : <>{isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  <span onClick={()=>{setIsSignUp(!isSignUp);setMessage('');}} style={{color:'#1E4040',fontWeight:700,cursor:'pointer',fontFamily:"'Fraunces',Georgia,serif"}}>
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </span>
                </>
            }
          </div>
        </div>

        {/* Footer */}
        <div style={{textAlign:'center',fontSize:11,color:'#7A9898',letterSpacing:2,marginTop:36,animation:'st-fadeUp 1s ease 0.2s both'}}>
          &copy; {new Date().getFullYear()} SUPTRACK &middot; CLINICAL SUPERVISION PLATFORM
        </div>
      </div>
    </>
  )
}
