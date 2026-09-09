import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../features/auth/useAuth'
import AuthLayout from './AuthLayout'
import './AuthForms.css'

export default function LoginPage() {
  const { login } = useAuth(); const navigate = useNavigate(); const location = useLocation(); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [show,setShow]=useState(false); const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const from=(location.state as {from?:string}|null)?.from
  async function submit(e:React.FormEvent){e.preventDefault();setError('');setBusy(true);try{const user=await login({email,password});const target=from??(user.roles.includes('Admin')?'/admin':user.roles.includes('Employee')?'/staff':'/portal');navigate(target,{replace:true})}catch(err:any){setError(err?.response?.data?.detail??err?.response?.data?.message??'Invalid email or password.')}finally{setBusy(false)}}
  return <AuthLayout title="Welcome back" subtitle="Sign in to continue to your Amazing Accountant client account."><form onSubmit={submit} className="auth-form">{error&&<div role="alert" className="auth-form__error">{error}</div>}<label className="field">Email<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></label><label className="field">Password<div className="auth-form__password"><input type={show?'text':'password'} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" required/><button type="button" onClick={()=>setShow(!show)} className="auth-form__visibility" aria-label={show?'Hide password':'Show password'}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label><button disabled={busy} className="brand-button auth-form__submit">{busy?'Signing in…':'Sign in'}</button><p className="auth-form__switch">Don't have an account? <Link to="/register">Create one</Link></p></form></AuthLayout>
}
