import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { 
  Mail, Lock, User, GraduationCap, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle, Github
} from 'lucide-react'
import { auth, googleProvider } from '../firebase'
import { signInWithPopup } from 'firebase/auth'

// Custom SVGs for Social Buttons
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)


export default function Login() {
  const navigate = useNavigate()
  const { loginUser, registerUser, loginWithGoogle } = useApp()
  
  const [isLogin, setIsLogin] = useState(false) // Default to Signup to match photo
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [college, setCollege] = useState('IIT Patna')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (isLogin) {
      if (!email || !password) {
        setError('Please enter both email and password.')
        return
      }

      setLoading(true)
      try {
        const res = await loginUser(email, password)
        setLoading(false)
        if (res.success) {
          setSuccess(true)
          if (res.onboardingCompleted) {
            navigate('/dashboard')
          } else {
            navigate('/onboarding')
          }
        } else {
          setError(res.message || 'Login failed')
        }
      } catch (err) {
        setLoading(false)
        setError(err.message || 'An error occurred during login')
      }

    } else {
      if (!name || !email || !password || !college) {
        setError('Please fill in all fields to register.')
        return
      }

      setLoading(true)
      try {
        const res = await registerUser(name, email, password, college)
        setLoading(false)
        if (res.success) {
          setSuccess(true)
          setTimeout(() => {
            navigate('/onboarding')
          }, 1000)
        } else {
          setError(res.message || 'Registration failed')
        }
      } catch (err) {
        setLoading(false)
        setError(err.message || 'An error occurred during registration')
      }
    }
  }
  
  const handleSocialLogin = async (platform) => {
    if (platform === 'google') {
      setError('')
      setLoading(true)
      try {
        const result = await signInWithPopup(auth, googleProvider)
        const user = result.user
        
        const res = await loginWithGoogle(
          user.email,
          user.displayName || 'Google User',
          user.photoURL,
          user.uid
        )
        
        setLoading(false)
        if (res.success) {
          setSuccess(true)
          if (res.onboardingCompleted) {
            navigate('/dashboard')
          } else {
            navigate('/onboarding')
          }
        } else {
          setError(res.message)
        }
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    } else {
      // Future GitHub integration
      setError('GitHub login not implemented yet')
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF1E4] flex items-center justify-center select-none font-sans overflow-x-hidden">
      
      {/* Full screen gradient container matching the design */}
      <div className="w-full min-h-screen bg-gradient-to-br from-[#FCECD8] via-[#F4CFB0] to-[#E3A376] relative flex flex-col pt-8 pb-12 px-6 md:px-16 lg:px-32">
        
        {/* Top Right Toggle */}
        <div className="absolute top-6 right-6 md:top-10 md:right-12 flex gap-1.5 text-sm z-20">
          <span className="text-[#8B7665] font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="font-bold text-[#1A1A1A] hover:underline transition-all"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </div>

        {/* Form Container */}
        <div className="max-w-[420px] w-full mx-auto my-auto pt-10 md:pt-0 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-[42px] md:text-[54px] leading-tight font-medium text-[#111] mb-2 tracking-tight">
                {isLogin ? "Welcome Back" : "Build Your Flow"}
              </h1>
              <p className="text-[#8B7665] text-[15px] md:text-[16px] leading-relaxed mb-8 font-medium">
                {isLogin 
                  ? "Log in to view active campus projects and feeds." 
                  : "Create your account and get started\nwith a clear mind"}
              </p>

              {/* Status Indicators */}
              {error && (
                <div className="bg-red-50/80 border border-red-200/50 rounded-[16px] p-3 flex items-center gap-2 text-sm text-red-600 font-medium mb-6 backdrop-blur-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="bg-emerald-50/80 border border-emerald-200/50 rounded-[16px] p-3 flex items-center gap-2 text-sm text-emerald-600 font-medium mb-6 backdrop-blur-sm animate-pulse">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{isLogin ? 'Authentication successful!' : 'Registration successful!'}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {!isLogin && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7665]" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full pl-12 pr-4 py-4 bg-transparent border border-[#d8b8a3] hover:border-[#b89b88] rounded-[20px] text-[15px] text-[#111] placeholder:text-[#A38E7A] focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] transition-all font-medium"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7665]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full pl-12 pr-4 py-4 bg-transparent border border-[#d8b8a3] hover:border-[#b89b88] rounded-[20px] text-[15px] text-[#111] placeholder:text-[#A38E7A] focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] transition-all font-medium"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7665]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-12 pr-12 py-4 bg-transparent border border-[#d8b8a3] hover:border-[#b89b88] rounded-[20px] text-[15px] text-[#111] placeholder:text-[#A38E7A] focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B7665] hover:text-[#111] transition-colors"
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>

                {!isLogin && (
                  <div className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7665]" />
                    <select
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-transparent border border-[#d8b8a3] hover:border-[#b89b88] rounded-[20px] text-[15px] text-[#111] focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] transition-all font-medium appearance-none cursor-pointer"
                    >
                      <option value="IIT Patna" className="text-black">IIT Patna</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#121212] hover:bg-[#000] text-[#FDF1E4] text-[15px] font-medium py-4 rounded-[20px] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-xl disabled:opacity-50"
                >
                  {loading ? (isLogin ? 'Signing In...' : 'Creating Account...') : (isLogin ? 'Log In' : 'Sign Up')}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>

              {/* Social Login Section */}
              <div className="flex flex-col mt-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-[1px] bg-[#d8b8a3]/50"></div>
                  <span className="text-[#8B7665] text-[13px] font-medium">or continue with</span>
                  <div className="flex-1 h-[1px] bg-[#d8b8a3]/50"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    className="flex flex-row items-center justify-center gap-2 py-3.5 px-4 bg-transparent border border-[#d8b8a3] hover:border-[#b89b88] rounded-[20px] transition-colors cursor-pointer"
                  >
                    <GoogleIcon />
                    <span className="text-[14px] font-medium text-[#111]">Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('github')}
                    className="flex flex-row items-center justify-center gap-2 py-3.5 px-4 bg-transparent border border-[#d8b8a3] hover:border-[#b89b88] rounded-[20px] transition-colors cursor-pointer"
                  >
                    <Github className="w-[18px] h-[18px] text-[#111]" />
                    <span className="text-[14px] font-medium text-[#111]">GitHub</span>
                  </button>
                </div>
              </div>

              {/* Footer Terms */}
              <div className="mt-8 text-center text-[#8B7665] text-[13px] font-medium leading-relaxed">
                By {isLogin ? 'logging in' : 'signing up'}, you agree to our <br className="hidden md:block" />
                <a href="#" className="text-[#111] font-medium hover:underline">Terms of Service</a> and <a href="#" className="text-[#111] font-medium hover:underline">Privacy Policy</a>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>



      </div>
    </div>
  )
}
