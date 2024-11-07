from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import yt_dlp
import os
from urllib.parse import unquote

app = Flask(__name__)
CORS(app)

DOWNLOAD_FOLDER = "downloads"
if not os.path.exists(DOWNLOAD_FOLDER):
    os.makedirs(DOWNLOAD_FOLDER)


@app.route("/download", methods=["GET"])
def download_video():
    url = unquote(request.args.get("url", ""))
    format = request.args.get("format", "mp4")

    # Log received URL and format for debugging
    print(f"Received URL: '{url}', Format: '{format}'")

    # Validate that URL is provided
    if not url:
        return jsonify({"success": False, "error": "URL is required"}), 400

    # Validate format
    if format not in ["mp4", "mp3"]:
        return (
            jsonify(
                {
                    "success": False,
                    "error": 'Invalid format. Must be either "mp4" or "mp3".',
                }
            ),
            400,
        )

    try:
        # Options for yt-dlp
        if format == "mp4":
            # Choose a progressive stream, which contains both audio and video (no need for FFmpeg to merge)
            ydl_opts = {
                "format": "bestaudio+bestevideo/bestvideo",  # Best video+audio, or video only
                "outtmpl": os.path.join(
                    DOWNLOAD_FOLDER, "%(title)s.%(ext)s"
                ),  # Save to the 'downloads' folder
                "noplaylist": True,  # Avoid downloading playlists
            }
        elif format == "mp3":
            # Choose the best audio only stream (MP3)
            ydl_opts = {
                "format": "bestaudio/best",  # Best audio only
                "outtmpl": os.path.join(DOWNLOAD_FOLDER, "%(title)s.%(ext)s"),
                "noplaylist": True,  # Avoid downloading playlists
            }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=True)
            filename = f"{info_dict['title']}.{format}"

            # Return the success response with the download link
            return jsonify(
                {
                    "success": True,
                    "downloadUrl": f"/download_file/{filename}",
                    "title": info_dict["title"],
                    "format": format,
                }
            )

    except Exception as e:
        # Log any error that occurs during the video download process
        app.logger.error(f"Error downloading video: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/download_file/<filename>")
def download_file(filename):
    # Serve the file for download
    return send_file(os.path.join(DOWNLOAD_FOLDER, filename), as_attachment=True)


if __name__ == "__main__":
    app.run(debug=True)
