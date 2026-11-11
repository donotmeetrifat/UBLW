'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

// Dynamically import GrainGradient to guarantee 100% WebGL SSR safety on Vercel
const GrainGradient = dynamic(
  () =>
    import('@paper-design/shaders-react').then((mod) => mod.GrainGradient),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-[#060B1A]" />,
  }
)

export default function AuthSection({ initialMode = 'signin' }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams?.get('redirect') || '/'

  const [mode, setMode] = useState(initialMode) // 'signin' | 'signup' | 'forgot'
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    const modeParam = searchParams?.get('mode')
    if (modeParam === 'forgot') {
      setMode('forgot')
    } else if (modeParam === 'signin') {
      setMode('signin')
    } else if (modeParam === 'signup') {
      setMode('signup')
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    // MODE: FORGOT PASSWORD
    if (mode === 'forgot') {
      const rawEmail = email.trim()
      if (!rawEmail || !rawEmail.includes('@')) {
        setErrorMsg('Please enter your registered email address.')
        return
      }
      setLoading(true)
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: rawEmail }),
        })
        const data = await res.json()
        if (data.success) {
          setSuccessMsg(data.message || 'Password recovery link dispatched! Check your inbox.')
        } else {
          setErrorMsg(data.message || 'Unable to process request.')
        }
      } catch (err) {
        setErrorMsg('Network error. Please check your internet connection.')
      } finally {
        setLoading(false)
      }
      return
    }

    // MODE: SIGN UP
    if (mode === 'signup') {
      const trimmedFirst = firstName.trim()
      const trimmedLast = lastName.trim()
      const fullName = trimmedLast ? `${trimmedFirst} ${trimmedLast}` : trimmedFirst
      const rawEmail = email.trim()
      const rawPhone = phone.replace(/[^0-9]/g, '')

      if (!trimmedFirst) {
        setErrorMsg('Please enter your first name.')
        return
      }

      if (!rawEmail || !rawEmail.includes('@') || !rawEmail.includes('.')) {
        setErrorMsg('Please enter a valid email address.')
        return
      }

      if (!rawPhone || rawPhone.length < 11) {
        setErrorMsg('Please enter a valid 11-digit phone number (e.g. 01XXXXXXXXX).')
        return
      }

      if (!password || password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.')
        return
      }

      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify and try again.')
        return
      }

      setLoading(true)

      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fullName,
            email: rawEmail,
            phone: rawPhone,
            password,
            confirmPassword,
          }),
        })

        const data = await res.json()

        if (!res.ok || !data.success) {
          setErrorMsg(data.message || 'Unable to create account. Please try again.')
          return
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('ukbl_current_user', JSON.stringify(data.user))
          window.dispatchEvent(new Event('auth-change'))
        }

        toast.success('Welcome to UK Brand Lover!')
        setSuccessMsg('Account created successfully! Redirecting...')

        setTimeout(() => {
          router.push(redirectUrl)
          router.refresh()
        }, 700)
      } catch (err) {
        setErrorMsg('Unable to connect to authentication server. Please try again.')
      } finally {
        setLoading(false)
      }
      return
    }

    // MODE: SIGN IN
    if (mode === 'signin') {
      const rawInput = email.trim()
      if (!rawInput) {
        setErrorMsg('Please enter your email address or phone number.')
        return
      }

      if (!password) {
        setErrorMsg('Please enter your password.')
        return
      }

      setLoading(true)

      try {
        const res = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: rawInput,
            password,
          }),
        })

        const data = await res.json()

        if (!res.ok || !data.success) {
          setErrorMsg(data.message || 'Invalid login credentials. Please try again.')
          return
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('ukbl_current_user', JSON.stringify(data.user))
          window.dispatchEvent(new Event('auth-change'))
        }

        const firstNameDisplay = (data.user?.name || 'Valued Customer').split(' ')[0]
        toast.success(`Welcome back, ${firstNameDisplay}!`)
        setSuccessMsg('Signed in successfully! Redirecting...')

        setTimeout(() => {
          if (data.user?.role === 'ADMIN' && redirectUrl === '/') {
            router.push('/store/orders')
          } else {
            router.push(redirectUrl)
          }
          router.refresh()
        }, 600)
      } catch (err) {
        setErrorMsg('Unable to connect to authentication server. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <section className="min-h-screen bg-[#F8FAFF] text-slate-900 antialiased flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-poppins selection:bg-[#6C306E] selection:text-white">
      {/* Ambient Sheen Backdrop */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(0,102,255,0.12),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-10 w-[500px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(108,48,110,0.10),transparent_70%)] blur-3xl" />

      {/* Main Auth Container - Balanced 85% Screen Proportions with Smooth Entrance */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative z-10 w-[92%] sm:w-[88%] lg:w-[85%] max-w-[1680px] min-h-[82vh] lg:min-h-[85vh] rounded-3xl border border-slate-200/90 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] overflow-hidden grid lg:grid-cols-[1.12fr_0.88fr]"
      >
        {/* Left Form Column */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white text-slate-900">
          <div className="max-w-[400px] w-full mx-auto">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between mb-6 sm:mb-7">
              <Link
                href="/"
                className="group inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5 stroke-[2.2] group-hover:-translate-x-0.5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Back to Home</span>
              </Link>

              {/* Mode Switcher */}
              <div className="flex items-center gap-1 text-xs">
                {mode === 'forgot' ? (
                  <>
                    <span className="text-slate-400">Remember password?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin')
                        setErrorMsg(null)
                        setSuccessMsg(null)
                      }}
                      className="font-bold text-[#6C306E] hover:text-[#521C54] underline underline-offset-2 transition-colors cursor-pointer ml-1"
                    >
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-slate-400">
                      {mode === 'signup' ? 'Have an account?' : 'No account?'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === 'signup' ? 'signin' : 'signup')
                        setErrorMsg(null)
                        setSuccessMsg(null)
                        setConfirmPassword('')
                      }}
                      className="font-bold text-[#6C306E] hover:text-[#521C54] underline underline-offset-2 transition-colors cursor-pointer ml-1"
                    >
                      {mode === 'signup' ? 'Sign in' : 'Create one'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Title & Subtitle with Smooth Animated Switch */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="mb-6 sm:mb-7"
              >
                <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-tight">
                  {mode === 'signup'
                    ? 'Create an account'
                    : mode === 'signin'
                    ? 'Welcome back'
                    : 'Reset your password'}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  {mode === 'signup'
                    ? 'Join us to discover authentic UK beauty, delivered across Bangladesh.'
                    : mode === 'signin'
                    ? 'Sign in to access your bag, orders, and personalized beauty care.'
                    : "Enter your registered email and we'll send you a password recovery link."}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Error & Success Feedback Banners */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium"
              >
                <div className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-rose-500 shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <span>{errorMsg}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium space-y-1.5 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-emerald-600 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="font-semibold">{successMsg}</span>
                </div>
              </motion.div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* First Name & Last Name (Sign Up only) */}
              <AnimatePresence initial={false}>
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="grid gap-3 sm:grid-cols-2 overflow-hidden"
                  >
                    <FieldBox
                      label="First Name"
                      value={firstName}
                      onChange={(val) => setFirstName(val)}
                    />
                    <FieldBox
                      label="Last Name"
                      placeholder="Optional"
                      value={lastName}
                      onChange={(val) => setLastName(val)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email (Always visible) */}
              <FieldBox
                label="Email"
                type="email"
                placeholder={mode === 'signin' ? 'name@example.com or phone' : 'name@example.com'}
                value={email}
                onChange={(val) => setEmail(val)}
              />

              {/* Number (Sign Up only) */}
              <AnimatePresence initial={false}>
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <FieldBox
                      label="Number"
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={phone}
                      onChange={(val) => setPhone(val)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Password (Sign In & Sign Up) */}
              <AnimatePresence initial={false}>
                {mode !== 'forgot' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden space-y-2"
                  >
                    <FieldBox
                      label="Password"
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(val) => setPassword(val)}
                    />

                    {/* Forgot Password Link in Sign In mode */}
                    {mode === 'signin' && (
                      <div className="flex justify-end pt-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setMode('forgot')
                            setErrorMsg(null)
                            setSuccessMsg(null)
                          }}
                          className="text-[11px] sm:text-xs font-semibold text-[#6C306E] hover:text-[#521C54] underline underline-offset-2 transition-colors cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Confirm Password (Sign Up only) */}
              <AnimatePresence initial={false}>
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <FieldBox
                      label="Confirm Password"
                      type="password"
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(val) => setConfirmPassword(val)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full h-11 sm:h-12 mt-3 rounded-xl bg-[#6C306E] hover:bg-[#521C54] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>
                      {mode === 'signup'
                        ? 'Joining...'
                        : mode === 'signin'
                        ? 'Signing In...'
                        : 'Sending Recovery Link...'}
                    </span>
                  </div>
                ) : (
                  <span>
                    {mode === 'signup'
                      ? 'Join Us'
                      : mode === 'signin'
                      ? 'Sign In to UK Brand Lover'
                      : 'Send Recovery Link'}
                  </span>
                )}
              </motion.button>
            </form>
          </div>
        </div>

        {/* Right Animated Shader Column */}
        <div className="relative flex min-h-[420px] lg:min-h-full overflow-hidden bg-[#060B1A] p-8 sm:p-12 lg:p-16 text-white flex-col justify-end">
          {/* Blue Silk GrainGradient Shader matching Exframer Website Theme */}
          <GrainGradient
            speed={0.8}
            scale={1.2}
            rotation={0}
            offsetX={0}
            offsetY={0}
            softness={0.55}
            intensity={0.65}
            noise={0.22}
            shape="corners"
            frame={2854.5}
            colors={['#FFFFFF', '#0066FF', '#38BDF8', '#0052CC']}
            colorBack="#060B1A"
            className="absolute inset-0 bg-[#060B1A]"
          />

          {/* Clean, Iconic Minimalist Headline */}
          <div className="relative z-10 max-w-md">
            <h2 className="text-4xl sm:text-5xl lg:text-[66px] font-bold tracking-[-0.04em] text-white leading-[1.02]">
              Think fast,
              <br />
              Build faster
            </h2>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

/**
 * Clean, compact input field box tailored to Xframer's design
 * with right-aligned uppercase label and visibility toggle for password fields.
 */
function FieldBox({
  label,
  value,
  type = 'text',
  placeholder,
  onChange,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <label className="flex h-11 sm:h-12 items-center justify-between gap-2.5 rounded-xl border border-slate-200/90 bg-white px-3.5 sm:px-4 text-xs sm:text-sm text-slate-900 transition-all focus-within:border-[#6C306E] focus-within:ring-2 focus-within:ring-[#6C306E]/20 cursor-text shadow-sm hover:border-slate-300">
      <input
        type={inputType}
        value={value}
        placeholder={placeholder}
        aria-label={label}
        onChange={(e) => onChange?.(e.target.value)}
        className="min-w-0 flex-1 truncate bg-transparent text-slate-900 outline-none placeholder:text-slate-400 text-xs sm:text-sm font-normal"
      />
      <div className="flex items-center gap-1.5 shrink-0">
        {isPassword && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowPassword(!showPassword)
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer rounded-md hover:bg-slate-100 flex items-center justify-center"
          >
            {showPassword ? (
              <svg
                className="w-4 h-4 stroke-[2]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 stroke-[2]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        )}
        <span className="text-slate-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider select-none">
          {label}
        </span>
      </div>
    </label>
  )
}
