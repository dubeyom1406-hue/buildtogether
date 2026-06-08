import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { 
  User, Code, Palette, Target, Cpu, GraduationCap, 
  Briefcase, Zap, ArrowRight, ArrowLeft, Sparkles, CheckCircle 
} from 'lucide-react'

export default function Onboarding() {
  const navigate = useNavigate()
  const { currentUser, completeOnboarding } = useApp()
  
  const [step, setStep] = useState(1)
  const [name, setName] = useState(currentUser?.name || '')
  const [field, setField] = useState('Tech/Developer')
  const [role, setRole] = useState('Student')
  const [collegeOrCompany, setCollegeOrCompany] = useState(currentUser?.college || 'IIT Patna')
  const [isFinishing, setIsFinishing] = useState(false)

  // Field Options
  const fieldOptions = [
    { id: 'Tech/Developer', label: 'Tech & Development', icon: Code, desc: 'Software developers, web engineers, coders' },
    { id: 'UI/UX Designer', label: 'UI/UX & Design', icon: Palette, desc: 'Product designers, UI artists, graphics' },
    { id: 'Product Manager', label: 'Product & Project Management', icon: Target, desc: 'PMs, coordinators, team leaders' },
    { id: 'AI & Web3 Specialist', label: 'AI & Web3 Research', icon: Cpu, desc: 'ML developers, smart contract devs' }
  ]

  // Role Options
  const roleOptions = [
    { id: 'Student', label: 'University Student', icon: GraduationCap, desc: 'Currently enrolled in a degree program' },
    { id: 'Professional', label: 'Working Professional', icon: Briefcase, desc: 'Working in the industry, looking to side-hustle' },
    { id: 'Freelancer', label: 'Freelancer / Builder', icon: Zap, desc: 'Self-employed, open to collaborative sprints' }
  ]

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      // Finalize Onboarding
      setIsFinishing(true)
      
      const onboardingData = {
        name,
        field,
        role,
        college: role === 'Student' ? collegeOrCompany : '',
        company: role !== 'Student' ? collegeOrCompany : '',
        skills: field === 'Tech/Developer' ? ['React', 'Node.js'] : field === 'UI/UX Designer' ? ['Figma', 'UI/UX'] : ['Management']
      }

      setTimeout(() => {
        completeOnboarding(onboardingData)
        navigate('/dashboard')
      }, 1500)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4 select-none font-sans overflow-hidden">
      
      {/* Background Sphere Glows */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-brand-primary/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-brand-primary/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Main Card Container */}
      <div className="bg-white border border-[#EFEFEF] w-full max-w-[600px] rounded-[36px] shadow-2xl p-8 md:p-12 relative min-h-[480px] flex flex-col justify-between overflow-hidden">
        
        {/* Step Progress Indicators */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#F4F4F4]">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-wide text-brand-primary">be2gether</span>
            <span className="text-slate-300">|</span>
            <span className="text-[10px] text-[#9A9FA5] font-bold uppercase tracking-wider">Setup profile</span>
          </div>
          
          {/* Visual dots */}
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div 
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? 'w-6 bg-brand-primary' : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step content with animation */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* FINISHING STATE SCREEN */}
            {isFinishing ? (
              <motion.div
                key="finishing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center flex flex-col items-center gap-4 py-8"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm animate-bounce">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-extrabold text-[#1A1D1F]">Setting up your workspace...</h2>
                <p className="text-xs text-[#9A9FA5] font-semibold max-w-[320px]">
                  Saving your preferences and preparing DTU campus networking hub dashboard.
                </p>
              </motion.div>
            ) : (
              <>
                {/* STEP 1: ASK FULL NAME */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-5"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-brand-primary font-bold uppercase tracking-widest">Step 1 of 3</span>
                      <h1 className="text-2xl font-extrabold text-[#1A1D1F]">Let's start with your name</h1>
                      <p className="text-xs text-[#9A9FA5] font-semibold">
                        How should other co-founders and student builders address you on campus?
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-2">
                      <label className="text-[9px] font-bold text-[#6F767E] uppercase tracking-wider">Your Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#9A9FA5]" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                          className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-bold transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: CHOOSE FIELD */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-5"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-brand-primary font-bold uppercase tracking-widest">Step 2 of 3</span>
                      <h1 className="text-2xl font-extrabold text-[#1A1D1F]">Choose your domain</h1>
                      <p className="text-xs text-[#9A9FA5] font-semibold">
                        What is your primary discipline or field of interest?
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                      {fieldOptions.map((opt) => {
                        const Icon = opt.icon
                        const isSelected = field === opt.id
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setField(opt.id)}
                            className={`border rounded-2xl p-4 flex gap-3 cursor-pointer transition-all hover:shadow-md ${
                              isSelected 
                                ? 'bg-brand-light border-brand-primary border-2 text-brand-primary' 
                                : 'bg-white border-[#EFEFEF] hover:border-slate-300 text-slate-800'
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                              <Icon className="w-4.5 h-4.5" />
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-xs font-extrabold truncate">{opt.label}</span>
                              <span className={`text-[9px] font-medium leading-tight ${
                                isSelected ? 'text-brand-primary/80' : 'text-slate-400'
                              }`}>{opt.desc}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: WORK / PROFILE STATUS */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-brand-primary font-bold uppercase tracking-widest">Step 3 of 3</span>
                      <h1 className="text-2xl font-extrabold text-[#1A1D1F]">Your background profile</h1>
                      <p className="text-xs text-[#9A9FA5] font-semibold">
                        Are you currently studying at a university, or working in the tech sector?
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 mt-1">
                      {roleOptions.map((opt) => {
                        const Icon = opt.icon
                        const isSelected = role === opt.id
                        return (
                          <div
                            key={opt.id}
                            onClick={() => {
                              setRole(opt.id)
                              setCollegeOrCompany(opt.id === 'Student' ? 'IIT Patna' : '')
                            }}
                            className={`border rounded-xl p-3 flex flex-col items-center text-center gap-2 cursor-pointer transition-all hover:shadow-sm ${
                              isSelected 
                                ? 'bg-brand-light border-brand-primary border-2 text-brand-primary font-bold' 
                                : 'bg-white border-[#EFEFEF] hover:border-slate-300 text-slate-800'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isSelected ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-extrabold">{opt.label}</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* DYNAMIC FIELD (College vs Company) */}
                    <div className="flex flex-col gap-1.5 mt-2">
                      <label className="text-[9px] font-bold text-[#6F767E] uppercase tracking-wider">
                        {role === 'Student' ? 'Institution / University Campus' : 'Company / Organization Name'}
                      </label>
                      
                      {role === 'Student' ? (
                        <div className="relative">
                          <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#9A9FA5]" />
                          <select
                            value={collegeOrCompany}
                            onChange={(e) => setCollegeOrCompany(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary font-bold transition-all shadow-sm"
                          >
                            <option value="IIT Patna">IIT Patna</option>
                          </select>
                        </div>
                      ) : (
                        <div className="relative">
                          <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9FA5]" />
                          <input
                            type="text"
                            required
                            value={collegeOrCompany}
                            onChange={(e) => setCollegeOrCompany(e.target.value)}
                            placeholder="e.g. Google, Stripe, or Freelance Builder"
                            className="w-full pl-11 pr-4 py-2.5 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-bold transition-all shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </>
            )}

          </AnimatePresence>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        {!isFinishing && (
          <div className="flex items-center justify-between border-t border-[#F4F4F4] pt-6 mt-6">
            {/* Back button */}
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`text-slate-500 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                step === 1 ? 'opacity-30 pointer-events-none' : 'hover:text-slate-800'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {/* Next / Submit button */}
            <button
              onClick={handleNext}
              disabled={step === 1 && !name.trim()}
              className="bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold px-6 py-3 rounded-2xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-40"
            >
              <span>{step === 3 ? 'Complete Setup' : 'Next Step'}</span>
              {step === 3 ? <Sparkles className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
