import React, { useState, useEffect } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { evaluateAnswer } from '../services/interview.api.js'
import { useNavigate, useParams } from 'react-router'



const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>) },
    { id: 'behavioral', label: 'Behavioral Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { id: 'roadmap', label: 'Road Map', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>) },
]

// ── Sub-components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index, questionType = "technical", jobDescription = "" }) => {
    const [ open, setOpen ] = useState(false)
    const [ activeTab, setActiveTab ] = useState('guide') // 'guide' | 'practice'
    const [ userAnswer, setUserAnswer ] = useState("")
    const [ evaluating, setEvaluating ] = useState(false)
    const [ evaluation, setEvaluation ] = useState(null)
    const [ error, setError ] = useState("")

    // Stopwatch timer for mock interview practice
    const [ timerSeconds, setTimerSeconds ] = useState(0)
    const [ timerRunning, setTimerRunning ] = useState(false)

    useEffect(() => {
        let interval = null
        if (timerRunning) {
            interval = setInterval(() => {
                setTimerSeconds(s => s + 1)
            }, 1000)
        } else {
            clearInterval(interval)
        }
        return () => clearInterval(interval)
    }, [ timerRunning ])

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60)
        const s = secs % 60
        return `${m}:${s < 10 ? '0' : ''}${s}`
    }

    const handleEvaluate = async () => {
        if (!userAnswer.trim()) {
            setError("Please write your answer before asking the AI coach to evaluate.")
            return
        }
        setError("")
        setEvaluating(true)
        setTimerRunning(false)
        try {
            const data = await evaluateAnswer({
                question: item.question,
                userAnswer,
                questionType,
                jobDescription
            })
            setEvaluation(data.evaluation)
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to evaluate answer")
        } finally {
            setEvaluating(false)
        }
    }

    const handleResetPractice = () => {
        setUserAnswer("")
        setEvaluation(null)
        setTimerSeconds(0)
        setTimerRunning(false)
        setError("")
    }

    return (
        <div className='q-card'>
            <div className='q-card__header' onClick={() => setOpen(o => !o)}>
                <span className='q-card__index'>Q{index + 1}</span>
                <p className='q-card__question'>{item.question}</p>
                <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
            </div>

            {open && (
                <div className='q-card__body'>
                    {/* Navigation Tabs between Guide and Practice Mode */}
                    <div className='q-card__tabs'>
                        <button
                            type="button"
                            className={`q-card__tab-btn ${activeTab === 'guide' ? 'q-card__tab-btn--active' : ''}`}
                            onClick={() => setActiveTab('guide')}
                        >
                            💡 Model Answer & Guidance
                        </button>
                        <button
                            type="button"
                            className={`q-card__tab-btn ${activeTab === 'practice' ? 'q-card__tab-btn--active' : ''}`}
                            onClick={() => setActiveTab('practice')}
                        >
                            🎯 Practice with AI Coach {evaluation && `(Score: ${evaluation.score}%)`}
                        </button>
                    </div>

                    {activeTab === 'guide' ? (
                        <>
                            <div className='q-card__section'>
                                <span className='q-card__tag q-card__tag--intention'>Interviewer Intent</span>
                                <p>{item.intention}</p>
                            </div>
                            <div className='q-card__section'>
                                <span className='q-card__tag q-card__tag--answer'>Model Answer</span>
                                <p>{item.answer}</p>
                            </div>
                        </>
                    ) : (
                        <div className='practice-box'>
                            <div className='practice-box__header'>
                                <span>Draft your response (aim for ~150-250 words or 2 minutes):</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <div className='practice-box__timer'>
                                        ⏱️ {formatTime(timerSeconds)}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setTimerRunning(r => !r)}
                                        style={{
                                            background: timerRunning ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                                            color: timerRunning ? '#f87171' : '#38bdf8',
                                            border: 'none',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {timerRunning ? 'Pause' : 'Start Timer'}
                                    </button>
                                </div>
                            </div>

                            <textarea
                                className='practice-box__textarea'
                                placeholder="Structure your answer using STAR: Situation (context), Task (goal/problem), Action (your specific actions), and Result (quantifiable impact)..."
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                disabled={evaluating}
                            />

                            {error && <p style={{ color: '#f87171', margin: 0, fontSize: '0.82rem' }}>⚠️ {error}</p>}

                            <div className='practice-box__actions'>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    {userAnswer.trim().split(/\s+/).filter(Boolean).length} words
                                </span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {(userAnswer || evaluation) && (
                                        <button
                                            type="button"
                                            onClick={handleResetPractice}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                color: '#94a3b8',
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.82rem'
                                            }}
                                        >
                                            Reset
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleEvaluate}
                                        disabled={evaluating}
                                        style={{
                                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '0.45rem 1rem',
                                            borderRadius: '6px',
                                            fontWeight: '600',
                                            fontSize: '0.85rem',
                                            cursor: evaluating ? 'not-allowed' : 'pointer',
                                            opacity: evaluating ? 0.7 : 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem'
                                        }}
                                    >
                                        {evaluating ? 'Evaluating with AI...' : 'Evaluate Answer with AI ✨'}
                                    </button>
                                </div>
                            </div>

                            {/* Evaluation Result Card */}
                            {evaluation && (
                                <div className='evaluation-card'>
                                    <div className='evaluation-card__header'>
                                        <div>
                                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>AI Coach Evaluation</span>
                                            <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.1rem', color: '#f8fafc' }}>Performance Score</h3>
                                        </div>
                                        <div className={`evaluation-card__score-badge ${
                                            evaluation.score >= 80 ? 'evaluation-card__score-badge--high' :
                                            evaluation.score >= 60 ? 'evaluation-card__score-badge--mid' :
                                            'evaluation-card__score-badge--low'
                                        }`}>
                                            <span>{evaluation.score}</span>
                                            <span style={{ fontSize: '0.8rem' }}>/ 100</span>
                                        </div>
                                    </div>

                                    {/* STAR Checklist */}
                                    <div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>STAR Framework Breakdown:</span>
                                        <div className='evaluation-card__star-grid'>
                                            <div className={`evaluation-card__star-item ${evaluation.starChecklist?.situation ? 'evaluation-card__star-item--yes' : 'evaluation-card__star-item--no'}`}>
                                                {evaluation.starChecklist?.situation ? '✅' : '❌'} Situation
                                            </div>
                                            <div className={`evaluation-card__star-item ${evaluation.starChecklist?.task ? 'evaluation-card__star-item--yes' : 'evaluation-card__star-item--no'}`}>
                                                {evaluation.starChecklist?.task ? '✅' : '❌'} Task
                                            </div>
                                            <div className={`evaluation-card__star-item ${evaluation.starChecklist?.action ? 'evaluation-card__star-item--yes' : 'evaluation-card__star-item--no'}`}>
                                                {evaluation.starChecklist?.action ? '✅' : '❌'} Action
                                            </div>
                                            <div className={`evaluation-card__star-item ${evaluation.starChecklist?.result ? 'evaluation-card__star-item--yes' : 'evaluation-card__star-item--no'}`}>
                                                {evaluation.starChecklist?.result ? '✅' : '❌'} Result
                                            </div>
                                        </div>
                                    </div>

                                    <div className='evaluation-card__feedback'>
                                        <strong style={{ color: '#f1f5f9' }}>Coach Feedback: </strong>
                                        {evaluation.feedback}
                                    </div>

                                    {evaluation.strengths?.length > 0 && (
                                        <div>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4ade80' }}>Key Strengths:</span>
                                            <ul className='evaluation-card__list evaluation-card__list--strengths'>
                                                {evaluation.strengths.map((str, idx) => (
                                                    <li key={idx}>{str}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {evaluation.improvements?.length > 0 && (
                                        <div>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fb923c' }}>Areas to Improve:</span>
                                            <ul className='evaluation-card__list evaluation-card__list--improvements'>
                                                {evaluation.improvements.map((imp, idx) => (
                                                    <li key={idx}>{imp}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {evaluation.improvedAnswer && (
                                        <div className='evaluation-card__improved'>
                                            <h4>✨ Recommended Polished Version</h4>
                                            <p>{evaluation.improvedAnswer}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const RoadMapDay = ({ day }) => (
    <div className='roadmap-day'>
        <div className='roadmap-day__header'>
            <span className='roadmap-day__badge'>Day {day.day}</span>
            <h3 className='roadmap-day__focus'>{day.focus}</h3>
        </div>
        <ul className='roadmap-day__tasks'>
            {day.tasks.map((task, i) => (
                <li key={i}>
                    <span className='roadmap-day__bullet' />
                    {task}
                </li>
            ))}
        </ul>
    </div>
)

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
    const [ activeNav, setActiveNav ] = useState('technical')
    const { report, getReportById, loading, getResumePdf } = useInterview()
    const { interviewId } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [ interviewId ])



    if (loading || !report) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    const scoreColor =
        report.matchScore >= 80 ? 'score--high' :
            report.matchScore >= 60 ? 'score--mid' : 'score--low'


    return (
        <div className='interview-page'>
            <div className='interview-layout'>

                {/* ── Left Nav ── */}
                <nav className='interview-nav'>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            padding: '0.4rem 0.5rem',
                            marginBottom: '0.8rem',
                            borderRadius: '6px'
                        }}
                    >
                        ← Back to Dashboard
                    </button>
                    <div className="nav-content">
                        <p className='interview-nav__label'>Sections</p>
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                onClick={() => setActiveNav(item.id)}
                            >
                                <span className='interview-nav__icon'>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => { getResumePdf(interviewId) }}
                        className='button primary-button' >
                        <svg height={"0.8rem"} style={{ marginRight: "0.8rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"></path></svg>
                        Download Resume
                    </button>
                </nav>

                <div className='interview-divider' />

                {/* ── Center Content ── */}
                <main className='interview-content'>
                    {activeNav === 'technical' && (
                        <section>
                            <div className='content-header'>
                                <h2>Technical Questions</h2>
                                <span className='content-header__count'>{report.technicalQuestions.length} questions</span>
                            </div>
                            <div className='q-list'>
                                {report.technicalQuestions.map((q, i) => (
                                    <QuestionCard
                                        key={i}
                                        item={q}
                                        index={i}
                                        questionType="technical"
                                        jobDescription={report.jobDescription}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'behavioral' && (
                        <section>
                            <div className='content-header'>
                                <h2>Behavioral Questions</h2>
                                <span className='content-header__count'>{report.behavioralQuestions.length} questions</span>
                            </div>
                            <div className='q-list'>
                                {report.behavioralQuestions.map((q, i) => (
                                    <QuestionCard
                                        key={i}
                                        item={q}
                                        index={i}
                                        questionType="behavioral"
                                        jobDescription={report.jobDescription}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'roadmap' && (
                        <section>
                            <div className='content-header'>
                                <h2>Preparation Road Map</h2>
                                <span className='content-header__count'>{report.preparationPlan.length}-day plan</span>
                            </div>
                            <div className='roadmap-list'>
                                {report.preparationPlan.map((day) => (
                                    <RoadMapDay key={day.day} day={day} />
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                <div className='interview-divider' />

                {/* ── Right Sidebar ── */}
                <aside className='interview-sidebar'>

                    {/* Match Score */}
                    <div className='match-score'>
                        <p className='match-score__label'>Match Score</p>
                        <div className={`match-score__ring ${scoreColor}`}>
                            <span className='match-score__value'>{report.matchScore}</span>
                            <span className='match-score__pct'>%</span>
                        </div>
                        <p className='match-score__sub'>Strong match for this role</p>
                    </div>

                    <div className='sidebar-divider' />

                    {/* Skill Gaps */}
                    <div className='skill-gaps'>
                        <p className='skill-gaps__label'>Skill Gaps</p>
                        <div className='skill-gaps__list'>
                            {report.skillGaps.map((gap, i) => (
                                <span key={i} className={`skill-tag skill-tag--${gap.severity}`}>
                                    {gap.skill}
                                </span>
                            ))}
                        </div>
                    </div>

                </aside>
            </div>
        </div>
    )
}

export default Interview