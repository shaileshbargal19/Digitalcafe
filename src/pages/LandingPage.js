import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const LandingPage = () => {
    const location = useLocation();

    React.useEffect(() => {
        if (location.hash) {
            const id = location.hash.substring(1);
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [location.hash]);

    return (
        <div className="landing-page">
            <Navbar />
            <Hero />
            <div id="services"><Services /></div>
            <div id="about"><About /></div>
            <div id="contact"><Contact /></div>
            <Footer />
        </div>
    );
};

export default LandingPage;
