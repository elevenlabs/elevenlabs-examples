from create_a_dub_from_file import create_dub_from_file


def main():
    result = create_dub_from_file(
        "../example_speech.mp3",  # Input file path
        "dubbed_file.mp4",  # Output file path
        "audio/mpeg",  # File format
        "en",  # Source language
        "es",  # Target language
    )
    (
        print("Dubbing was successful! File saved at:", result)
        if result
        else print("Dubbing failed or timed out.")
    )


if __name__ == "__main__":
    main()
