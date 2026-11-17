import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Register = () => {
    const navigate = useNavigate()
    const [ username, setUsername ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ error, setError ] = useState("")
    const [ submitting, setSubmitting ] = useState(false)

    const { loading, handleRegister } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSubmitting(true)
        try {
            await handleRegister({ username, email, password })
            navigate("/")
        } catch (err) {
            setError(err.message || "Registration failed. Please check inputs.")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <main className="auth-loading-screen">
                <div className="spinner"></div>
                <p>Creating your session...</p>
            </main>
        )
    }

    return (
        <main>
            <div className="form-container">
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🚀</div>
                    <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Create Account</h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                        Start preparing for high-paying tech interviews
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#f87171',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        marginBottom: '1rem'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Choose a Username</label>
                        <input
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            type="text"
                            id="username"
                            name='username'
                            placeholder='e.g. aditya_dev'
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            id="email"
                            name='email'
                            placeholder='e.g. aditya@example.com'
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            id="password"
                            name='password'
                            placeholder='Create a strong password (min 6 chars)'
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className='button primary-button'
                        style={{ width: '100%', marginTop: '0.5rem', opacity: submitting ? 0.7 : 1 }}
                    >
                        {submitting ? "Creating Account..." : "Get Started Free"}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem' }}>
                    Already have an account? <Link to={"/login"} style={{ color: '#a78bfa', fontWeight: '600' }}>Sign In</Link>
                </p>
            </div>
        </main>
    )
}

export default Register
