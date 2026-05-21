// src/pages/InternalTools/LandingPages/PreviewPage.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { previewLandingPage } from '../../../../api/landingPages';

export default function PreviewPage() {
    const { id } = useParams<{ id: string }>();
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPreview = async () => {
            try {
                const lpId = Number(id);
                if (isNaN(lpId)) {
                    setError('Invalid landing page ID');
                    return;
                }

                const preview = await previewLandingPage(lpId);
                setPreviewHtml(preview.html);
            } catch (err) {
                console.error('Failed to load preview:', err);
                setError('Failed to load preview. Please try again.');
            }
        };

        if (id) {
            loadPreview();
        }
    }, [id]);

    // Error state
    if (error) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                fontFamily: 'sans-serif',
                background: '#f5f5f5',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ color: '#333', marginBottom: '10px' }}>Preview Error</h2>
                    <p style={{ color: '#666' }}>{error}</p>
                </div>
            </div>
        );
    }

    // Loading state
    if (!previewHtml) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                fontFamily: 'sans-serif',
                background: '#fff',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #eee',
                        borderTop: '4px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 15px',
                    }} />
                    <p style={{ color: '#666' }}>Generating preview...</p>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    // Fullscreen preview - just the landing page
    return (
        <iframe
            srcDoc={previewHtml}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                margin: 0,
                padding: 0,
            }}
            title="Landing Page Preview"
        />
    );
}
