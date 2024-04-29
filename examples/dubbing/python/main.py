from create_a_dub import create_dub_file

def main():
    input_file_path = "example_speech.mp3"
    file_format = "audio/mpeg" 
    output_file_path = "dubbed_file.mp4"

    source_language = "en"
    target_language = "es"
    
    dubbed_result = create_dub_file(
        input_file_path=input_file_path,
        output_file_path=output_file_path,
        file_format=file_format,
        source_lang=source_language,
        target_language=target_language,
    )
    
    if dubbed_result:
        print(f"Dubbing was successful! File saved at: {dubbed_result}")
    else:
        print("Dubbing failed or timed out.")

if __name__ == "__main__":
    main()