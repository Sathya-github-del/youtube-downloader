import { useState } from 'react';
import './style.css';
const YouTubeDownloader = () => {
    const [url, setUrl] = useState('');
    const [format, setFormat] = useState('mp4');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [downloadLink, setDownloadLink] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setDownloadLink('');


        if (!url.trim()) {
            setError('Please provide a valid URL.');
            setIsLoading(false);
            return;
        }

        console.log('Submitting request for URL:', url);
        console.log('Selected format:', format);

        try {

            const response = await fetch(`http://localhost:5000/download?url=${encodeURIComponent(url)}&format=${format}`);

            if (!response.ok) {
                const errorData = await response.json();
                setError(`Error: ${errorData.error || 'Failed to get download link.'}`);
                console.error('Response Error:', errorData);
                return;
            }

            const data = await response.json();

            if (data.success) {
                // Set the download link if the request is successful
                setDownloadLink(`http://localhost:5000${data.downloadUrl}`);

                // Redirect to the original page after successful download
                setTimeout(() => {
                    history.push('/'); // This redirects to the homepage or any other path you define
                }, 5000); // Wait 5 seconds before redirecting
            } else {
                // Set the error message if the response is not successful
                setError(data.error || 'Failed to get download link. Please check the URL and try again.');
            }
        } catch (err) {
            setError('An error occurred. Please try again later.');
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="youtube-downloader">
            <h1>Youtube Video Downloader</h1>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="url">Video URL:</label>
                    <input
                        type="url"
                        id="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                        placeholder="https://www.youtube.com/watch?v=..."
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="format">Format:</label>
                    <select
                        id="format"
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                    >
                        <option value="mp4">MP4 (Video)</option>
                        <option value="mp3">MP3 (Audio)</option>
                    </select>
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Download'}
                </button>
            </form>


            {error && <p className="error">{error}</p>}


            {downloadLink && (
                <div className="download-section">
                    <p>Your download is ready!</p>

                </div>
            )}
        </div>
    );
};

export default YouTubeDownloader;
