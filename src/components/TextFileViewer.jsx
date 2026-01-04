import { useState, useEffect } from 'react';
import './TextFileViewer.css';

const TextFileViewer = ({ url, name, onClose }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchContent = async () => {
            try {
                setLoading(true);

                // Robust URL normalization for Windows + Electron 'media://' protocol
                let safeUrl = url;

                // 1. Remove existing protocol if present to start clean
                if (safeUrl.startsWith('media://')) {
                    safeUrl = safeUrl.replace(/^media:\/\/*/, '');
                } else if (safeUrl.startsWith('file://')) {
                    safeUrl = safeUrl.replace(/^file:\/\/*/, '');
                }

                // 2. Decode in case it was encoded
                try { safeUrl = decodeURIComponent(safeUrl); } catch (e) { }

                // 3. Normalize slashes (Windows backslash -> forward slash)
                safeUrl = safeUrl.replace(/\\/g, '/');

                // 4. Ensure drive letter has no leading slash for next step (e.g. /C:/ -> C:/)
                if (safeUrl.match(/^\/[a-zA-Z]:/)) {
                    safeUrl = safeUrl.substring(1);
                }

                // 5. Re-attach protocol properly
                // Electron often wants "media://C:/Folder/File.txt" or "media:///C:/Folder/File.txt"
                // Let's use the format that works best with the registered handler.
                // Based on main.js handler regex: request.url.replace(/^media:\/\/+/, '')
                // It handles multiple slashes fine.
                safeUrl = `media:///${safeUrl}`;

                console.log(`[TextFileViewer] Fetching: ${safeUrl} (Original: ${url})`);

                const response = await fetch(safeUrl);
                if (!response.ok) {
                    // Try fallback without triple slash if first failed
                    if (safeUrl.startsWith('media:///')) {
                        const retryUrl = safeUrl.replace('media:///', 'media://');
                        console.log(`[TextFileViewer] Retrying with: ${retryUrl}`);
                        const response2 = await fetch(retryUrl);
                        if (response2.ok) {
                            const text = await response2.text();
                            if (isMounted) {
                                setContent(text);
                                setLoading(false);
                            }
                            return;
                        }
                    }
                    throw new Error(`Fehler beim Laden (${response.status}): ${response.statusText}`);
                }

                const text = await response.text();
                if (isMounted) {
                    setContent(text);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Text fetch error:", err);
                if (isMounted) {
                    setError(err.message);
                    setLoading(false);
                }
            }
        };

        if (url) {
            fetchContent();
        }

        return () => {
            isMounted = false;
        };
    }, [url]);

    return (
        <div className="text-viewer-overlay" onClick={onClose}>
            <div className="text-viewer-container" onClick={e => e.stopPropagation()}>
                <div className="text-viewer-header">
                    <h3>📄 {name}</h3>
                    <div className="text-viewer-actions">
                        <button className="btn-close" onClick={onClose}>×</button>
                    </div>
                </div>
                <div className="text-viewer-content">
                    {loading && <div className="loading-spinner">Wird geladen...</div>}
                    {error && <div className="error-message">❌ {error}</div>}
                    {!loading && !error && (
                        <pre className="code-block">
                            <code>{content}</code>
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TextFileViewer;
