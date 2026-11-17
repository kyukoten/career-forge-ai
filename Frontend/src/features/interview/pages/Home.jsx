import React, { useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useAuth } from '../../auth/hooks/useAuth.js'
import { useNavigate } from 'react-router'

const Home = () => {
    const { loading, generateReport, reports } = useInterview()
    const { user, handleLogout } = useAuth()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ selectedFile, setSelectedFile ] = useState(null)
    const [ validationError, setValidationError ] = useState("")
    const resumeInputRef = useRef()

    const navigate = useNavigate()

    const onLogout = async () => {
        await handleLogout()
        navigate('/login')
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
            setValidationError("")
        }
    }

    const handleRemoveFile = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setSelectedFile(null)
        if (resumeInputRef.current) {
            resumeInputRef.current.value = ""
        }
    }

    const handleGenerateReport = async () => {
        setValidationError("")

        if (!jobDescription.trim() || jobDescription.trim().length < 20) {
            setValidationError("Please paste a meaningful job description (at least 20 characters) to analyze.")
            return
        }

        if (!selectedFile && (!selfDescription.trim() || selfDescription.trim().length < 15)) {
            setValidationError("Please either upload a Resume (PDF) or provide a quick self-description of your skills.")
            return
        }

        const data = await generateReport({
            jobDescription,
            selfDescription,
            resumeFile: selectedFile
        })

        if (data?._id) {
            navigate(`/interview/${data._id}`)
        }
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <div className='ai-pulsar'>
                    <div className='ai-pulsar__ring'></div>
                    <div className='ai-pulsar__core'>🚀</div>
                </div>
                <h2>Analyzing Profile with CareerForge AI...</h2>
                <p className='loading-subtitle'>
                    Evaluating ATS match, extracting skill gaps, and generating interview questions
                </p>
                <div className='loading-bar'>
                    <div className='loading-bar__inner'></div>
                </div>
            </main>
        )
    }

    return (
        <div className='home-page'>
            {/* Top Navigation Bar */}
            <nav className='app-navbar'>
                <div className='app-navbar__brand'>
                    <span className='app-navbar__logo'>🚀</span>
                    <span className='app-navbar__title'>CareerForge <span className='highlight'>AI</span></span>
                </div>
                <div className='app-navbar__actions'>
                    {user && (
                        <div className='app-navbar__user'>
                            <span className='app-navbar__avatar'>{user.username.charAt(0).toUpperCase()}</span>
                            <span className='app-navbar__username'>{user.username}</span>
                        </div>
                    )}
                    <button onClick={onLogout} className='app-navbar__logout'>
                        Log Out
                    </button>
                </div>
            </nav>

            {/* Page Header */}
            <header className='page-header'>
                <div className='badge-pill'>Powered by Google Gemini 2.5</div>
                <h1>Architect Your Next <span className='highlight'>Tech Interview</span></h1>
                <p>Upload your resume and paste your target job requirements. Our AI performs deep ATS keyword scoring, identifies skill gaps, and builds tailored interview practice questions.</p>
            </header>

            {validationError && (
                <div className='validation-alert'>
                    <span>⚠️</span>
                    <p>{validationError}</p>
                </div>
            )}

            {/* Main Dual-Panel Card */}
            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => {
                                setJobDescription(e.target.value)
                                if (validationError) setValidationError("")
                            }}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here...\ne.g. 'Senior Full-Stack Engineer at Google requires React, Node.js, distributed caching, and microservice architecture...'`}
                            maxLength={5000}
                        />
                        <div className='char-counter'>{jobDescription.length} / 5000 chars</div>
                    </div>

                    {/* Vertical Divider */}
                    <div className='panel-divider' />

                    {/* Right Panel - Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        {/* Upload Resume */}
                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best ATS Results</span>
                            </label>

                            {selectedFile ? (
                                <div className='selected-file-card'>
                                    <span className='file-icon'>📄</span>
                                    <div className='file-meta'>
                                        <p className='file-name'>{selectedFile.name}</p>
                                        <p className='file-size'>{(selectedFile.size / 1024).toFixed(1)} KB &bull; Ready for ATS parse</p>
                                    </div>
                                    <button
                                        type='button'
                                        onClick={handleRemoveFile}
                                        className='remove-file-btn'
                                        title='Remove resume'
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <label className='dropzone' htmlFor='resume'>
                                    <span className='dropzone__icon'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                    </span>
                                    <p className='dropzone__title'>Click to upload or drag &amp; drop</p>
                                    <p className='dropzone__subtitle'>PDF resume (Max 5MB)</p>
                                    <input
                                        ref={resumeInputRef}
                                        onChange={handleFileChange}
                                        hidden
                                        type='file'
                                        id='resume'
                                        name='resume'
                                        accept='.pdf'
                                    />
                                </label>
                            )}
                        </div>

                        {/* OR Divider */}
                        <div className='or-divider'><span>OR</span></div>

                        {/* Quick Self-Description */}
                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                value={selfDescription}
                                onChange={(e) => {
                                    setSelfDescription(e.target.value)
                                    if (validationError) setValidationError("")
                                }}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your tech stack, years of experience, and past projects if you don't have a resume handy..."
                            />
                        </div>

                        {/* Info Box */}
                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                            </span>
                            <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate your customized plan.</p>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className='interview-card__footer'>
                    <span className='footer-info'>⚡ Gemini 2.5 Flash &bull; Deep ATS Match &bull; Approx 10–15s</span>
                    <button
                        onClick={handleGenerateReport}
                        className='generate-btn'
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        Generate Interview Strategy
                    </button>
                </div>
            </div>

            {/* Recent Reports List */}
            {reports && reports.length > 0 && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Plans ({reports.length})</h2>
                    <ul className='reports-list'>
                        {reports.map(report => (
                            <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                <div className='report-item__content'>
                                    <h3>{report.title || 'Untitled Tech Position'}</h3>
                                    <p className='report-meta'>Created on {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <div className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>
                                    {report.matchScore}% Match
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Page Footer */}
            <footer className='page-footer'>
                <p>CareerForge AI &bull; Built with React, Node.js, Express, MongoDB &amp; Google Gemini</p>
                <div className='footer-links'>
                    <a href='https://github.com/kyukoten/career-forge-ai' target='_blank' rel='noopener noreferrer'>GitHub Repository</a>
                    <span>&bull;</span>
                    <span>Created by @kyukoten</span>
                </div>
            </footer>
        </div>
    )
}

export default Home
