from pytube import YouTube
from io import BytesIO


def download_youtube_video_or_audio(link : str, filename : str) -> BytesIO:
    try:
        yt = YouTube(link)
        video = yt.streams.get_lowest_resolution()
        
        buffer = BytesIO()
        print('Processing...')
        video.stream_to_buffer(buffer)
        buffer.seek(0)
        with open(f"youtube_{filename}"+'.mp4', "wb") as f:
            f.write(buffer.read())
        print(f"Download completed! Video saved.")
        return buffer
    except Exception as err:
        print(err)
        print("An error has occurred")
    
    


link = input("Enter the YouTube video URL: ")
filename = input('Enter output file name: ')
download_youtube_video_or_audio(link, filename)