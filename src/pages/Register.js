import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Toast, useToast } from '../components/Toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/LandingStyles.css';
import '../styles/AuthStyles.css';
import API_BASE_URL from '../apiConfig';
import Tesseract from 'tesseract.js';

const Register = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [step, setStep] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const { toasts, addToast, removeToast } = useToast();
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', gender: '', dob: '', email: '', phone: '',
        address: '', city: '', pincode: '', state: '', country: '',
        documentType: '', documentFile: null,
        education: '', gradeType: 'percentage', gradeValue: '', experienceYears: '',
        role: '', roleMetadata: '', password: '', confirmPassword: '',
        foodPreference: 'Veg', allergies: '', favCuisine: '', diningStyle: 'Dine-In', loyaltyOptIn: true
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'role' && value !== 'ADMIN') {
                updated.password = '';
                updated.confirmPassword = '';
            }
            return updated;
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
                addToast('Only Images (JPG/PNG) and PDFs are supported for verification.', 'error', 5000);
                return;
            }
            setFormData(prev => ({ ...prev, documentFile: file }));
        }
    };

    const handleStepClick = (targetStep) => {
        if (targetStep < step) setStep(targetStep);
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
                addToast('Only Images (JPG/PNG) and PDFs are supported for verification.', 'error', 5000);
                return;
            }
            setFormData(prev => ({ ...prev, documentFile: file }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.role === 'ADMIN' && formData.password !== formData.confirmPassword) {
            addToast('Passwords do not match', 'error');
            return;
        }

        // 1. Filter and Clean Payload to match backend RegisterRequest DTO
        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            gender: formData.gender,
            dob: formData.dob,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            role: formData.role,
            address: formData.address,
            city: formData.city,
            pincode: formData.pincode,
            state: formData.state,
            country: formData.country,
            documentType: formData.documentType,
            education: formData.education,
            gradeType: formData.gradeType,
            gradeValue: formData.gradeValue,
            roleMetadata: formData.roleMetadata
        };

        // 2. Handle Document Path via Real OCR Extraction
        if (formData.documentFile) {
            if (formData.documentFile.type.startsWith('image/')) {
                setIsExtracting(true);
                addToast('Scanning physical document... Please wait.', 'info', 4000);
                try {
                    const { data: { text } } = await Tesseract.recognize(
                        formData.documentFile,
                        'eng'
                    );
                    // Truncate to 250 chars to fit in VARCHAR(255) DB column
                    payload.documentPath = text.substring(0, 250); // Send real extracted text
                } catch (err) {
                    console.error("OCR Extraction Failed", err);
                    payload.documentPath = formData.documentFile.name; // Fallback to filename
                } finally {
                    setIsExtracting(false);
                }
            } else {
                // If not an image, just send filename
                payload.documentPath = formData.documentFile.name;
            }
        }

        // 3. Convert experienceYears to Number or null (empty string causes server error)
        payload.experienceYears = formData.experienceYears === '' ? null : parseInt(formData.experienceYears);

        // 4. Role-specific overrides for roleMetadata if needed
        if (formData.role === 'CUSTOMER') {
            payload.roleMetadata = formData.foodPreference; // Map food preference to metadata for customers
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                if (data.tempPasswordBackup) {
                    addToast(`Registration Successful! Temporary Password: ${data.tempPasswordBackup}`, 'success', 20000);
                    setTimeout(() => navigate('/login'), 8000);
                } else {
                    addToast('Registration Successful! Pending Admin Approval.', 'success', 6000);
                    setTimeout(() => navigate('/login'), 4000);
                }
            } else {
                const contentType = response.headers.get("content-type");
                let errorMessage = 'Registration Failed: Check inputs';

                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } else {
                    errorMessage = await response.text();
                }

                addToast(errorMessage, 'error', 5000);
            }
        } catch (error) {
            console.error('Registration failed:', error);
            addToast('Server not responding', 'error');
        }
    };

    const renderRoleFields = () => {
        switch (formData.role) {

            case 'CAFE_OWNER':
                return (
                    <div className="role-specific animate-pane">
                        <div className="field-group full-width">
                            <label>Cafe / Restaurant Name</label>
                            <input
                                type="text"
                                name="roleMetadata"
                                placeholder="e.g. Morning Dew Cafe"
                                value={formData.roleMetadata}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                );

            case 'CUSTOMER':
                return (
                    <div className="role-specific animate-pane mt-4">
                        <div className="field-group full-width">
                            <label>Preferred Cuisine Type</label>
                            <select name="foodPreference" value={formData.foodPreference} onChange={handleChange} className="elite-select">
                                <option value="Veg">Vegetarian</option>
                                <option value="Non-Veg">Non-Vegetarian</option>
                                <option value="Vegan">Vegan</option>
                                <option value="Egg">Eggetarian</option>
                            </select>
                        </div>
                    </div>
                );
            case 'ADMIN':
                return (
                    <div className="role-specific animate-pane">
                        <div className="matrix-grid">
                            <div className="field-group">
                                <label>Admin ID / Staff Code</label>
                                <input type="text" name="roleMetadata" placeholder="e.g. AD-2024-X" value={formData.roleMetadata} onChange={handleChange} required />
                            </div>
                            <div className="field-group">
                                <label>Set Access Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="elite-input"
                                />
                            </div>
                            <div className="field-group">
                                <label>Confirm Access Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="elite-input"
                                />
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="landing-page">
            <Navbar />

            <div className="auth-hero-section" style={{
                minHeight: '100vh',
                padding: '120px 0 80px',
                background: isDragging ? 'rgba(249, 115, 22, 0.05)' : 'var(--bg)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-150px',
                    left: '-150px',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(249, 115, 22, .05) 0%, transparent 65%)',
                    zIndex: 0
                }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <Toast toasts={toasts} removeToast={removeToast} />

                    <div className="register-alignment-wrapper" style={{
                        maxWidth: '1100px',
                        margin: '0 auto',
                        display: 'grid',
                        gridTemplateColumns: 'minmax(350px, 1fr) 1.5fr',
                        background: 'var(--surface)',
                        borderRadius: '32px',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-xl)',
                        border: '1px solid var(--border)',
                        minHeight: '700px'
                    }}>
                        {/* Sidebar with Image Background */}
                        <aside style={{
                            position: 'relative',
                            background: `linear-gradient(rgba(15, 23, 42, 0.55), rgba(15, 23, 42, 0.75)), url('/assets/img/auth-bg.png')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            padding: '60px 40px',
                            display: 'flex',
                            flexDirection: 'column',
                            color: 'white'
                        }}>
                            <div style={{ position: 'relative', zIndex: 2 }}>
                                <div className="hero-eyebrow" style={{ color: 'var(--orange)', borderColor: 'rgba(249, 115, 22, 0.3)', background: 'rgba(249, 115, 22, 0.1)' }}>
                                    <span className="hero-eyebrow-dot" style={{ background: 'var(--orange)' }}></span>
                                    REGISTRATION
                                </div>
                                <h2 style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: '2.5rem',
                                    marginBottom: '40px',
                                    color: 'white'
                                }}>
                                    Start Your <br /><span style={{ color: 'var(--orange)' }}>Journey</span>
                                </h2>

                                <nav className="step-nav" style={{ flex: 1 }}>
                                    {[1, 2, 3].map((s) => (
                                        <div
                                            key={s}
                                            className={`step-item ${step === s ? 'active' : step > s ? 'completed' : ''}`}
                                            style={{
                                                marginBottom: '24px',
                                                cursor: step > s ? 'pointer' : 'default',
                                                display: 'flex',
                                                gap: '16px',
                                                alignItems: 'center',
                                                padding: '16px',
                                                borderRadius: '16px',
                                                background: step === s ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                                border: step === s ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                                                backdropFilter: step === s ? 'blur(10px)' : 'none',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onClick={() => handleStepClick(s)}
                                        >
                                            <div className="step-num" style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.9rem',
                                                fontWeight: '900',
                                                border: '2px solid',
                                                borderColor: step === s ? 'var(--orange)' : step > s ? 'var(--orange)' : 'rgba(255,255,255,0.2)',
                                                background: step === s ? 'var(--orange)' : step > s ? 'var(--orange)' : 'rgba(255,255,255,0.05)',
                                                color: 'white',
                                                boxShadow: step === s ? '0 0 20px rgba(249, 115, 22, 0.4)' : 'none'
                                            }}>
                                                {step > s ? '✓' : `0${s}`}
                                            </div>
                                            <div className="step-info">
                                                <p style={{
                                                    fontSize: '0.65rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1.5px',
                                                    color: step === s ? 'var(--orange)' : 'rgba(255,255,255,0.5)',
                                                    fontWeight: '800',
                                                    margin: 0,
                                                }}>Step 0{s}</p>
                                                <h3 style={{
                                                    fontSize: '0.95rem',
                                                    fontWeight: '700',
                                                    margin: 0,
                                                    color: step >= s ? 'white' : 'rgba(255,255,255,0.4)',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    {s === 1 ? 'Personal Info' : s === 2 ? 'Location' : 'Verification'}
                                                </h3>
                                            </div>
                                        </div>
                                    ))}
                                </nav>
                            </div>

                            <div style={{ marginTop: 'auto', position: 'relative', zIndex: 2, padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                                <span style={{ color: 'var(--orange)', fontWeight: 'bold' }}>Note:</span> All data is encrypted using Digital Cafe Cloud Security protocols.
                            </div>
                        </aside>

                        {/* Main Interaction Area */}
                        <main style={{ padding: '60px 48px' }}>
                            <div style={{ marginBottom: '40px' }}>
                                <h4 style={{
                                    fontSize: '0.75rem',
                                    fontWeight: '800',
                                    letterSpacing: '1.5px',
                                    color: 'var(--text-3)',
                                    textTransform: 'uppercase',
                                    marginBottom: '10px'
                                }}>{step === 1 ? 'Profile Identity' : step === 2 ? 'Contact & Location' : 'Security & Verification'}</h4>
                                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: 'var(--text)' }}>
                                    {step === 1 ? 'Personal' : step === 2 ? 'Location' : 'Final'} <span style={{ color: 'var(--orange)' }}>Details</span>
                                </h2>
                                <div className="gold-divider" style={{ margin: '15px 0 0 0', width: '40px', background: 'var(--orange)' }}></div>
                            </div>

                            <form className="elite-form-matrix" onSubmit={handleSubmit}>
                                {step === 1 && (
                                    <div className="matrix-pane animate-pane">
                                        <div className="matrix-grid">
                                            <div className="field-group">
                                                <label>First Name</label>
                                                <input type="text" name="firstName" placeholder="Alexander" value={formData.firstName} onChange={handleChange} required style={{ height: '48px' }} />
                                            </div>
                                            <div className="field-group">
                                                <label>Last Name</label>
                                                <input type="text" name="lastName" placeholder="Pierce" value={formData.lastName} onChange={handleChange} required style={{ height: '48px' }} />
                                            </div>
                                            <div className="field-group">
                                                <label>Gender</label>
                                                <select name="gender" value={formData.gender} onChange={handleChange} required className="elite-select" style={{ height: '48px' }}>
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="field-group">
                                                <label>Birth Date</label>
                                                <input type="date" name="dob" value={formData.dob} onChange={handleChange} required style={{ height: '48px' }} />
                                            </div>
                                            <div className="field-group">
                                                <label>Email Address</label>
                                                <input type="email" name="email" placeholder="alex.p@example.com" value={formData.email} onChange={handleChange} required style={{ height: '48px' }} />
                                            </div>
                                            <div className="field-group">
                                                <label>Phone Number</label>
                                                <input type="tel" name="phone" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleChange} required style={{ height: '48px' }} />
                                            </div>
                                            <div className="field-group full-width">
                                                <label>Portal Access Role</label>
                                                <select name="role" value={formData.role} onChange={handleChange} required className="elite-select" style={{ height: '48px' }}>
                                                    <option value="">Select Your Role</option>
                                                    <option value="CUSTOMER">Customer (Dine & Discover)</option>
                                                    <option value="CAFE_OWNER">Cafe Owner (Business Management)</option>
                                                    <option value="ADMIN">System Administrator</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-actions-elite mt-4">
                                            <button type="button" className="hero-btn-primary w-full-btn" onClick={nextStep} style={{ height: '52px', justifyContent: 'center' }}>
                                                Proceed to Location →
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="matrix-pane animate-pane">
                                        <div className="field-group full-width">
                                            <label>Full Home Address</label>
                                            <input type="text" name="address" placeholder="House No, Street, Landmark" value={formData.address} onChange={handleChange} required style={{ height: '48px' }} />
                                        </div>
                                        <div className="matrix-grid mt-4">
                                            <div className="field-group">
                                                <label>City</label>
                                                <input type="text" name="city" value={formData.city} onChange={handleChange} required style={{ height: '48px' }} />
                                            </div>
                                            <div className="field-group">
                                                <label>Pincode</label>
                                                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required style={{ height: '48px' }} />
                                            </div>
                                            <div className="field-group">
                                                <label>State</label>
                                                <input type="text" name="state" value={formData.state} onChange={handleChange} required style={{ height: '48px' }} />
                                            </div>
                                            <div className="field-group">
                                                <label>Country</label>
                                                <input type="text" name="country" value={formData.country} onChange={handleChange} required style={{ height: '48px' }} />
                                            </div>
                                        </div>
                                        <div className="form-actions-elite split mt-4" style={{ display: 'flex', gap: '16px' }}>
                                            <button type="button" className="hero-btn-outline" onClick={prevStep} style={{ flex: 1, height: '52px' }}>← Back</button>
                                            <button type="button" className="hero-btn-primary" onClick={nextStep} style={{ flex: 2, height: '52px' }}>Final Verification →</button>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="matrix-pane animate-pane">
                                        {/* Show verification fields for all roles except ADMIN if desired, 
                                            but user asked for exact same structure as CafeOwner/Admin for Customer. 
                                            Actually ADMIN already shows password/confirm password here via renderRoleFields */}
                                        <div className="field-group full-width">
                                            <label>Verification Document Type</label>
                                            <select name="documentType" value={formData.documentType} onChange={handleChange} required className="elite-select" style={{ height: '48px' }}>
                                                <option value="">Select Identity Protocol</option>
                                                <option value="AADHAR">Aadhar ID (UIDAI)</option>
                                                <option value="PAN">PAN Card</option>
                                                <option value="PASSPORT">Passport (International)</option>
                                                <option value="VOTER_ID">Voter ID / EPIC</option>
                                                <option value="DRIVING_LICENSE">Driving License</option>
                                            </select>
                                        </div>

                                        <div
                                            className={`elite-upload-box ${isDragging ? 'dragging' : ''}`}
                                            style={{
                                                marginTop: '20px',
                                                padding: '32px',
                                                border: isDragging ? '2px dashed var(--orange)' : '2px dashed var(--border)',
                                                borderRadius: '16px',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                background: 'var(--bg)',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onClick={() => fileInputRef.current.click()}
                                             onDragOver={handleDragOver}
                                             onDragLeave={handleDragLeave}
                                             onDrop={handleDrop}
                                        >
                                            <input type="file" accept="image/png, image/jpeg, image/jpg, application/pdf" ref={fileInputRef} onChange={handleFileChange} hidden />
                                            <div className="upload-visual">
                                                <span style={{ fontSize: '2rem' }}>{formData.documentFile ? '✅' : '📄'}</span>
                                                <div className="upload-text mt-2">
                                                    {formData.documentFile ? (
                                                        <h3 style={{ fontSize: '0.9rem', color: 'var(--orange)', margin: 0 }}>{formData.documentFile.name}</h3>
                                                    ) : (
                                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', margin: 0 }}>Drag & Drop or <span style={{ color: 'var(--orange)', fontWeight: 'bold' }}>browse file</span></p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="matrix-grid mt-4">
                                            <div className="field-group">
                                                <label>Highest Education</label>
                                                <select name="education" value={formData.education} onChange={handleChange} required className="elite-select" style={{ height: '48px' }}>
                                                    <option value="">Select Qualification</option>
                                                    <option value="SSC">SSC (10th Standard)</option>
                                                    <option value="HSC">HSC (12th Standard)</option>
                                                    <option value="Diploma">Diploma / Vocational</option>
                                                    <option value="BCA">BCA (Comp. Applications)</option>
                                                    <option value="BSc">B.Sc (Science)</option>
                                                    <option value="BCom">B.Com (Commerce)</option>
                                                    <option value="BA">B.A (Arts)</option>
                                                    <option value="BE_BTech">B.E / B.Tech (Engineering)</option>
                                                    <option value="MCA">MCA (Post Grad Applications)</option>
                                                    <option value="MSc">M.Sc (Post Grad Science)</option>
                                                    <option value="MBA">MBA (Management)</option>
                                                    <option value="MTech">M.Tech (Specialization)</option>
                                                    <option value="PhD">PhD / Doctorate</option>
                                                    <option value="Other">Other / Professional</option>
                                                </select>
                                            </div>
                                            <div className="field-group">
                                                <label>Work Experience</label>
                                                <input type="number" name="experienceYears" placeholder="Years" value={formData.experienceYears} onChange={handleChange} required style={{ height: '48px' }} />
                                            </div>
                                        </div>

                                        {renderRoleFields()}

                                        <div className="form-actions-elite split mt-4" style={{ display: 'flex', gap: '16px' }}>
                                            <button type="button" className="hero-btn-outline" onClick={prevStep} style={{ flex: 1, height: '52px' }}>← Back</button>
                                            <button type="submit" className="hero-btn-primary" style={{ flex: 2, height: '52px' }} disabled={isExtracting}>
                                                {isExtracting ? 'Extracting Text...' : 'Complete Registration'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </main>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '32px' }}>
                        <p style={{ color: 'var(--text-3)', fontSize: '0.95rem' }}>
                            Already a member? <Link to="/login" style={{ color: 'var(--orange)', fontWeight: '800', textDecoration: 'none' }}>Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Register;
