import os
from typing import Optional
from pytube import YouTube


def download_youtube_video(video_url: str, download_path: str) -> str:
    """
    Downloads a YouTube video at the highest resolution available to a specified path.

    Args:
        video_url (str): The URL of the YouTube video to download.
        download_path (str): The directory path where the video will be downloaded.

    Returns:
        str: The file path to the downloaded video.
    """
    yt = YouTube(video_url)
    stream = yt.streams.get_highest_resolution()

    if not os.path.exists(download_path):
        os.makedirs(download_path)

    downloaded_file_path = stream.download(output_path=download_path)
    return downloaded_file_path


def create_dub_from_url(
    source_url: str,
    output_file_path: str,
    file_format: str,
    source_language: str,
    target_language: str,
) -> Optional[str]:
    """
    Downloads a video from a URL, and creates a dubbed version in the target language.

    Args:
        source_url (str): The URL of the source video to download and dub.
        output_file_path (str): The file path to save the dubbed file.
        file_format (str): The file format of the input file (used for dubbing).
        source_language (str): The language of the source video.
        target_language (str): The target language to dub into.

    Returns:
        Optional[str]: The file path of the dubbed file or None if operation failed.
    """
    download_path = "downloads"
    input_file_path = download_youtube_video(source_url, download_path)

    # Assuming `create_a_dub_from_file` is imported from some other module as before
    from create_a_dub_from_file import create_dub_from_file

    dubbed_result = create_dub_from_file(
        input_file_path=input_file_path,
        output_file_path=output_file_path,
        file_format=file_format,
        source_language=source_language,
        target_language=target_language,
    )

    # Optionally remove the downloaded file after dubbing
    os.remove(input_file_path)

    return dubbed_result
