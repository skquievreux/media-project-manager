import { SearchIcon, PlusIcon, SettingsIcon } from './Icons';
import './Header.css';

const Header = ({ onNewProject, onSearch, onSettings, onLogoClick }) => {
    return (
        <header className="header glass-strong">
            <div className="header-content">
                <div className="header-left">
                    <div
                        className="logo"
                        onClick={() => onLogoClick && onLogoClick()}
                        style={{ cursor: 'pointer' }}
                        title="Zum Dashboard"
                    >
                        <div className="logo-icon">
                            <span className="text-gradient">▶</span>
                        </div>
                        <h1 className="logo-text">
                            <span className="text-gradient">Media Manager</span>
                        </h1>
                    </div>
                </div>

                <div className="header-center">
                    <div className="search-bar">
                        <SearchIcon size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search projects, assets..."
                            onChange={(e) => onSearch && onSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="header-right">
                    <button className="btn-primary" onClick={onNewProject}>
                        <PlusIcon size={20} />
                        <span>New Project</span>
                    </button>
                    <button className="btn-ghost icon-btn" onClick={onSettings} title="Einstellungen">
                        <SettingsIcon size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
