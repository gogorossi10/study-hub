import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    BookOpen, FileSearch, Briefcase, ArrowRight, CheckCircle, Sparkles,
    Upload, FileText, Search, KanbanSquare, BarChart3, ChevronRight, Zap,
    Target, TrendingUp, Rocket, Layers, Cpu, Award, Star, GraduationCap,
    UserCheck, ShieldCheck, LogOut, CheckCircle2, Lock, NotebookPen
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import GradientWaves from './GradientWaves'
import PieBurst from './PieBurst'
import { AuthModal } from './AuthModal'
import { useAuth } from '../../context/AuthContext'
import './AuthModal.css'

type FeatureId = 'study' | 'resume' | 'career'

interface FeatureStep {
    icon: React.ElementType
    title: string
    description: string
    action: string
    link: string
}

interface Feature {
    id: FeatureId
    icon: React.ElementType
    accentIcon: React.ElementType
    title: string
    tagline: string
    description: string
    color: string
    gradient: string
    glowColor: string
    benefits: string[]
    steps: FeatureStep[]
}

const features: Feature[] = [
    {
        id: 'study',
        icon: BookOpen,
        accentIcon: Sparkles,
        title: 'Study Summarizer Studio',
        tagline: 'From hours of dry reading to minutes of total clarity',
        description: 'Drop any lecture PDF, paste raw notes, or upload chapter texts. Our AI distills long documents into executive summaries, key takeaways, flashcard concepts, and highlighted terms.',
        color: '#6366f1',
        gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        glowColor: 'rgba(99, 102, 241, 0.15)',
        benefits: [
            'Saves 60–80% of your textbook & lecture reading time',
            'Auto-extracts flashcard-style concepts for quick exam revision',
            'Highlights key definitions & core technical terms',
            'Formats output into bullet points, executive summaries, or study guides',
        ],
        steps: [
            {
                icon: Upload,
                title: 'Step 1: Upload or Paste Notes',
                description: 'Drop a lecture PDF, paste textbook notes, or insert web text into the studio.',
                action: 'Go to Upload',
                link: '/summarizer',
            },
            {
                icon: FileText,
                title: 'Step 2: Choose Output Format',
                description: 'Select Executive Summary, Flashcards, or Bullet Highlights.',
                action: 'Generate Summary',
                link: '/summarizer',
            },
            {
                icon: CheckCircle,
                title: 'Step 3: Review & Master',
                description: 'Study the clean summary and export your flashcards before exams.',
                action: 'Start Learning',
                link: '/summarizer',
            },
        ],
    },
    {
        id: 'resume',
        icon: FileSearch,
        accentIcon: Target,
        title: 'Resume Studio & ATS Analyzer',
        tagline: 'Score, fix, and rebuild your resume for 95%+ ATS pass rates',
        description: 'First, check how ATS systems filter your resume against target job descriptions. Then, use our guided builder to create a clean, professional Word resume.',
        color: '#0ea5e9',
        gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
        glowColor: 'rgba(14, 165, 233, 0.15)',
        benefits: [
            'Instant ATS compatibility score & missing skill detector',
            'Creates clean, downloadable Microsoft Word (.docx) resumes',
            'Step-by-step guided sections (Experience, Projects, Education)',
            'Multiple ATS-tested templates: Modern, Minimal, & Professional',
        ],
        steps: [
            {
                icon: Search,
                title: 'Step 1: Score Your Resume',
                description: 'Upload your current resume & paste a job description to get your ATS score.',
                action: 'Analyze Resume',
                link: '/analyzer',
            },
            {
                icon: FileText,
                title: 'Step 2: Fill Recommended Keywords',
                description: 'See missing technical skills & line-by-line improvement suggestions.',
                action: 'Fix Missing Skills',
                link: '/analyzer',
            },
            {
                icon: Briefcase,
                title: 'Step 3: Download Word Resume',
                description: 'Use the Resume Builder to export a perfectly styled Word resume.',
                action: 'Build Resume',
                link: '/builder',
            },
        ],
    },
    {
        id: 'career',
        icon: Briefcase,
        accentIcon: TrendingUp,
        title: 'Job Tracker & Search Studio',
        tagline: 'Search multi-portal jobs & track applications from saved to hired',
        description: 'Search internships across LinkedIn, Naukri, and Indeed from one unified search bar. Save jobs, track application stages on a Kanban board, and view career analytics.',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981, #059669)',
        glowColor: 'rgba(16, 185, 129, 0.15)',
        benefits: [
            'Search listings across LinkedIn, Naukri, & Indeed at once',
            'Visual Kanban pipeline (Saved → Applied → Interviewing → Offer)',
            'Real-time career analytics (interview rate, offer conversion)',
            'Supabase Cloud sync so your data is saved safely everywhere',
        ],
        steps: [
            {
                icon: Search,
                title: 'Step 1: Discover Openings',
                description: 'Use unified Job Search to find roles across LinkedIn, Naukri, and Indeed.',
                action: 'Search Listings',
                link: '/jobs',
            },
            {
                icon: KanbanSquare,
                title: 'Step 2: Add to Kanban Board',
                description: 'Track roles as you apply, schedule interviews, and receive offers.',
                action: 'Open Kanban Tracker',
                link: '/tracker',
            },
            {
                icon: BarChart3,
                title: 'Step 3: Monitor Pipeline Health',
                description: 'Check your Career Dashboard for application metrics & trending skills.',
                action: 'View Dashboard',
                link: '/dashboard',
            },
        ],
    },
]

const SECTOR_FEATURES = [
    { icon: BookOpen, label: 'Study Summarizer' },
    { icon: NotebookPen, label: 'Notes & Tasks' },
    { icon: FileSearch, label: 'Resume Analyzer' },
    { icon: FileText, label: 'Resume Builder' },
    { icon: BarChart3, label: 'Career Dashboard' },
    { icon: Search, label: 'Job Search' },
]

function SplashScreen({ onEnter }: { onEnter: () => void }) {
    const burstRef = useRef(0)
    const labelsRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let raf = 0
        const tick = () => {
            raf = requestAnimationFrame(tick)
            const amt = burstRef.current // 0 = circle closed, ~1 = max burst

            // Labels visible & come close when burst > 0.1, fully visible at burst = 0.4+
            const labelsOpacity = Math.max(0, Math.min(1, (amt - 0.08) * 3.5))
            // Scale labels from 0.85 (tucked close) to 1.0 (at sector position)
            const labelsScale = 0.85 + labelsOpacity * 0.15

            // Title visible when burst < 0.25, fully visible at burst = 0
            const titleOpacity = Math.max(0, Math.min(1, (0.3 - amt) * 4))
            const titleScale = 0.8 + titleOpacity * 0.2

            if (labelsRef.current) {
                labelsRef.current.style.opacity = String(labelsOpacity)
                labelsRef.current.style.transform = `translate(-50%, -50%) scale(${labelsScale})`
                labelsRef.current.style.pointerEvents = labelsOpacity > 0.5 ? 'auto' : 'none'
            }
            if (titleRef.current) {
                titleRef.current.style.opacity = String(titleOpacity)
                titleRef.current.style.transform = `translate(-50%, -50%) scale(${titleScale})`
            }
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [])

    return (
        <motion.div
            className="pieburst-entry-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="pieburst-canvas-wrap">
                <PieBurst
                    speed={18}
                    distance={10.5}
                    burstRef={burstRef}
                    baseColor="#22396F"
                    accentColor="#FCF1D0"
                />
            </div>

            {/* Feature labels — synced with burst animation */}
            <div className="pieburst-labels-ring" ref={labelsRef}>
                {SECTOR_FEATURES.map((feat, i) => {
                    const Icon = feat.icon
                    return (
                        <div key={feat.label} className={`pieburst-sector-label sector-pos-${i}`}>
                            <div className="sector-label-icon">
                                <Icon size={16} />
                            </div>
                            <span className="sector-label-text">{feat.label}</span>
                        </div>
                    )
                })}
            </div>

            {/* Central "Student Hub" — appears when circle is complete */}
            <div className="pieburst-center-title" ref={titleRef}>
                <span className="center-title-text">Student Hub</span>
            </div>

            <div className="pieburst-entry-content">
                <button className="pieburst-get-started-btn" onClick={onEnter}>
                    <Rocket size={22} /> Get Started Now <ArrowRight size={22} />
                </button>
            </div>
        </motion.div>
    )
}
export function FeatureShowcase() {
    const [hasEntered, setHasEntered] = useState(false)
    const [activeFeature, setActiveFeature] = useState<FeatureId>('study')
    const { user, isAuthenticated, logout, openAuthModal, requireAuth } = useAuth()
    const navigate = useNavigate()

    const feature = features.find((f) => f.id === activeFeature)!

    const handleLaunchClick = (link: string) => {
        if (requireAuth()) {
            navigate(link)
        }
    }

    if (!hasEntered) {
        return <SplashScreen onEnter={() => setHasEntered(true)} />
    }

    return (
        <div className="feature-showcase">
            {/* Top Student Passport / Quick Auth Bar */}
            <div className="top-auth-bar">
                {isAuthenticated && user ? (
                    <div className="user-passport">
                        <div className="passport-avatar">
                            <GraduationCap size={16} />
                        </div>
                        <div className="passport-info">
                            <strong>{user.name}</strong>
                            <span>{user.major}</span>
                        </div>
                        <span className="passport-status">
                            <ShieldCheck size={13} /> Active Passport
                        </span>
                        <button className="passport-logout" onClick={logout} title="Sign Out">
                            <LogOut size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="auth-trigger-group">
                        <span className="guest-status-pill">
                            <Lock size={12} /> Features Locked (Sign in to Access)
                        </span>
                        <button className="login-pill-btn" onClick={openAuthModal}>
                            <UserCheck size={14} /> Student Login / Sign Up
                        </button>
                    </div>
                )}
            </div>

            {/* Main Hype Hero Banner with WebGL Gradient Waves */}
            <motion.section
                id="studio-content"
                className="showcase-hero-hype"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="hero-waves-bg">
                    <GradientWaves
                        horizonColor="#5227FF"
                        waveColor="#FF9FFC"
                        crestColor="#FFFFFF"
                        speed={0.35}
                        amplitude={1.8}
                        waveScale={0.6}
                        waveRatio={0.9}
                        swell={25}
                        turbulence={15}
                        tilt={1.11}
                        zoom={1.25}
                        height={4.2}
                        fogDepth={15}
                        detail="medium"
                        brightness={1}
                        opacity={0.75}
                        mouseInteraction
                        parallaxStrength={0.5}
                        grain
                        grainIntensity={0.04}
                    />
                </div>
                <div className="hero-glow" />

                <div className="hero-hype-content">
                    <motion.div
                        className="hero-badge"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                    >
                        <Zap size={14} />
                        <span>STUDENT HUB 2.0 • ALL-IN-ONE ACADEMIC & CAREER STUDIO</span>
                    </motion.div>

                    <motion.h1
                        className="showcase-title-hype"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Supercharge Your Studies. Build Top Resumes.{' '}
                        <span className="title-gradient">Land Your Dream Tech Job.</span>
                    </motion.h1>

                    <motion.p
                        className="showcase-subtitle-hype"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                    >
                        The intelligent studio designed specifically for university students. Learn what features we offer below, understand how they help you, and log in to unlock full studio access.
                    </motion.p>

                    {/* Quick Hype Value Stats */}
                    <motion.div
                        className="hero-stats-strip"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                    >
                        <div className="stat-pill">
                            <span className="stat-num">80%</span>
                            <span className="stat-lbl">Reading Time Saved</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-pill">
                            <span className="stat-num">95%+</span>
                            <span className="stat-lbl">ATS Resume Match Rate</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-pill">
                            <span className="stat-num">3-in-1</span>
                            <span className="stat-lbl">Unified Student Tools</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-pill">
                            <span className="stat-num">100%</span>
                            <span className="stat-lbl">Free Cloud Sync</span>
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            {/* OUR MOTIVE & MISSION SECTION */}
            <section className="motive-section">
                <div className="section-header">
                    <span className="section-kicker">
                        <Rocket size={14} /> Our Core Motive
                    </span>
                    <h2>Built to Solve Student Academic & Job Search Struggles</h2>
                    <p>
                        We know being a university student can be overwhelming. Here is why Student Hub exists and how it helps you succeed.
                    </p>
                </div>

                <div className="motive-grid">
                    <div className="motive-card">
                        <div className="motive-icon study-gradient">
                            <BookOpen size={24} />
                        </div>
                        <h3>1. Eliminate Study Overwhelm</h3>
                        <p>
                            Students waste hours reading 80-page slides and dry textbooks before exams. Our AI Study Summarizer converts long chapters into structured executive summaries, key flashcard concepts, and highlighted definitions in seconds.
                        </p>
                        <div className="motive-footer">
                            <CheckCircle2 size={15} /> <span>Save up to 10+ hours per week</span>
                        </div>
                    </div>

                    <div className="motive-card">
                        <div className="motive-icon resume-gradient">
                            <FileSearch size={24} />
                        </div>
                        <h3>2. Beat ATS Resume Filters</h3>
                        <p>
                            75% of student resumes are auto-rejected by ATS scanners before a recruiter even views them. Resume Studio scores your resume against actual job descriptions, detects missing keywords, and exports ATS-approved Word resumes.
                        </p>
                        <div className="motive-footer">
                            <CheckCircle2 size={15} /> <span>Get 3x more interview callbacks</span>
                        </div>
                    </div>

                    <div className="motive-card">
                        <div className="motive-icon career-gradient">
                            <Briefcase size={24} />
                        </div>
                        <h3>3. Centralize Your Job Pipeline</h3>
                        <p>
                            Scattering job searches across LinkedIn, Naukri, and Indeed leads to forgotten applications. Our unified search and Kanban board keep your applications organized from Saved to Offer with real-time analytics.
                        </p>
                        <div className="motive-footer">
                            <CheckCircle2 size={15} /> <span>Never miss an interview deadline</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* INTERACTIVE FEATURE EXPLORER & SELECTION */}
            <section className="features-explorer-section">
                <div className="section-header">
                    <span className="section-kicker">
                        <Layers size={14} /> Feature Breakdown & Guided Instructions
                    </span>
                    <h2>Learn How Each Tool Works Step by Step</h2>
                    <p>Explore what each feature provides below. Log in anytime to unlock instant full studio access.</p>
                </div>

                {/* Feature Selector Tabs */}
                <div className="feature-cards">
                    {features.map((f) => {
                        const Icon = f.icon
                        const isSelected = activeFeature === f.id
                        return (
                            <button
                                key={f.id}
                                className={`feature-card ${isSelected ? 'active' : ''}`}
                                onClick={() => setActiveFeature(f.id)}
                                style={{
                                    ['--card-accent' as string]: f.color,
                                    ['--card-glow' as string]: f.glowColor,
                                }}
                            >
                                <div className="card-top">
                                    <div className="icon-badge" style={{ background: f.gradient }}>
                                        <Icon size={22} />
                                    </div>
                                    {isSelected && (
                                        <span className="active-pill">
                                            <Sparkles size={12} /> Viewing Overview
                                        </span>
                                    )}
                                </div>

                                <h3>{f.title}</h3>
                                <p className="card-tagline">{f.tagline}</p>
                                <p className="card-desc">{f.description}</p>

                                <div className="card-action">
                                    <span>See How It Works</span>
                                    <ChevronRight size={16} />
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Deep Dive Active Feature Panel */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={feature.id}
                        className="feature-detail-panel"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="detail-header">
                            <div className="detail-title-group">
                                <div className="detail-icon" style={{ background: feature.gradient }}>
                                    <feature.icon size={26} />
                                </div>
                                <div>
                                    <span className="detail-badge" style={{ color: feature.color }}>
                                        STUDIO 0{features.findIndex((f) => f.id === feature.id) + 1}
                                    </span>
                                    <h2>{feature.title}</h2>
                                    <p>{feature.tagline}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleLaunchClick(feature.steps[0].link)}
                                className="launch-studio-btn"
                                style={{ background: isAuthenticated ? feature.gradient : 'var(--accent)' }}
                            >
                                {isAuthenticated ? (
                                    <>
                                        <span>Launch {feature.title}</span>
                                        <ArrowRight size={18} />
                                    </>
                                ) : (
                                    <>
                                        <Lock size={16} />
                                        <span>Sign In to Unlock Studio</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Benefits & Key Highlights */}
                        <div className="detail-grid">
                            <div className="detail-benefits">
                                <h4>
                                    <Star size={16} /> How This Tool Helps You
                                </h4>
                                <ul>
                                    {feature.benefits.map((b, i) => (
                                        <li key={i}>
                                            <CheckCircle size={16} style={{ color: feature.color }} />
                                            <span>{b}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Step-by-Step Action Cards */}
                            <div className="detail-steps">
                                <h4>
                                    <Cpu size={16} /> Step-by-Step Instructions
                                </h4>
                                <div className="steps-list">
                                    {feature.steps.map((step, idx) => {
                                        const StepIcon = step.icon
                                        return (
                                            <div key={idx} className="step-card">
                                                <div className="step-num">{idx + 1}</div>
                                                <div className="step-content">
                                                    <div className="step-title-wrap">
                                                        <StepIcon size={16} className="step-icon" />
                                                        <h5>{step.title}</h5>
                                                    </div>
                                                    <p>{step.description}</p>
                                                    <button
                                                        onClick={() => handleLaunchClick(step.link)}
                                                        className="step-action-link-btn"
                                                    >
                                                        {isAuthenticated ? step.action : '🔒 Login to Perform Action'} <ArrowRight size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </section>

            {/* STUDENT TESTIMONIALS / REVIEWS */}
            <section className="testimonials-section">
                <div className="section-header">
                    <span className="section-kicker">
                        <Award size={14} /> Student Reviews
                    </span>
                    <h2>Loved by Students Preparing for Exams & Tech Careers</h2>
                    <p>Here is how Student Hub transforms everyday academic & job application workflows.</p>
                </div>

                <div className="reviews-grid">
                    <div className="review-card">
                        <div className="review-stars">★★★★★</div>
                        <p>
                            "Study Summarizer saved my finals week. I pasted 6 lecture transcripts and got flashcard concepts in seconds. Saved me at least 15 hours of reading!"
                        </p>
                        <div className="review-user">
                            <div className="avatar">R</div>
                            <div>
                                <strong>Rohan Verma</strong>
                                <span>Computer Science Senior • Tier-1 Tech Intern</span>
                            </div>
                        </div>
                    </div>

                    <div className="review-card">
                        <div className="review-stars">★★★★★</div>
                        <p>
                            "Resume Studio's ATS score analysis showed me 8 critical keywords missing from my resume. After fixing them and downloading the Word resume, I got 3 interview calls!"
                        </p>
                        <div className="review-user">
                            <div className="avatar">P</div>
                            <div>
                                <strong>Priya Sharma</strong>
                                <span>Data Engineering Student • Full-time Offer</span>
                            </div>
                        </div>
                    </div>

                    <div className="review-card">
                        <div className="review-stars">★★★★★</div>
                        <p>
                            "Having LinkedIn, Naukri, and Indeed job searches united with a Kanban tracker is a game changer. No more messy spreadsheets for job applications."
                        </p>
                        <div className="review-user">
                            <div className="avatar">A</div>
                            <div>
                                <strong>Anish Patel</strong>
                                <span>Information Technology • Frontend Developer</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Auth Modal */}
            <AuthModal />
        </div>
    )
}
