import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-left">
                    <p>&copy; {currentYear} Media Project Manager. All rights reserved.</p>
                </div>
                <div className="footer-right">
                    <a href="#about">About</a>
                    <a href="#help">Help</a>
                    <a href="#privacy">Privacy</a>
                    <span className="version">v1.0.0</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
