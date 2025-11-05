import os

from dotenv import load_dotenv
from elevenlabs import (
    AddProjectResponseModel,
    ProjectSnapshotResponse,
    PronunciationDictionaryVersionLocator,
    ProjectExtendedResponseModel,
    save,
)
from elevenlabs.client import ElevenLabs
from time import sleep
from io import BytesIO
from s3_uploader import upload_audiostream_to_s3, generate_presigned_url

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

if not ELEVENLABS_API_KEY:
    raise ValueError("Missing ELEVENLABS_API_KEY")


def main():
    if ELEVENLABS_API_KEY is None:
        print("Missing API KEY")
        return

    client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

    model = "eleven_turbo_v2"
    voice_id = "21m00Tcm4TlvDq8ikWAM"  # voice id for Rachel

    # can be changed to sample.epub or sample.pdf
    filename = "sample.txt"
    # if epub, the mime type should be application/epub+zip
    # if pdf, the mime type should be application/pdf
    mime_type = "text/plain"
    f = open(f"document/{filename}", "rb")

    add_project_response: AddProjectResponseModel = client.projects.add(
        name="example",
        from_document=(filename, f.read(), mime_type),
        default_model_id=model,
        default_title_voice_id=voice_id,
        default_paragraph_voice_id=voice_id,
    )

    f.close()

    print(f"Add project response:\n{add_project_response.dict()}")

    f_dict = open("dictionary.pls", "rb")

    # add a custom pronunciation dictionary
    pronunciation_dictionary = client.pronunciation_dictionary.add_from_file(
        file=f_dict.read(), name="example"
    )

    f_dict.close()

    print(f"Created dictionary {pronunciation_dictionary.dict()}")

    project_id = add_project_response.project.project_id

    # add the pronunciation dictionary to our project
    client.projects.update_pronunciation_dictionaries(
        project_id=project_id,
        pronunciation_dictionary_locators=[
            PronunciationDictionaryVersionLocator(
                pronunciation_dictionary_id=pronunciation_dictionary.id,
                version_id=pronunciation_dictionary.version_id,
            )
        ],
    )

    # start conversion process
    client.projects.convert(project_id=project_id)

    is_completed = False
    can_be_downloaded = False
    snapshot: ProjectSnapshotResponse = None
    project_info: ProjectExtendedResponseModel = None

    # wait for snapshot
    while not is_completed:
        if not can_be_downloaded:
            sleep(10)
            print("Checking if the project can be downloaded ...")

            project_info = client.projects.get(project_id)

            if project_info is None:
                raise Exception("project_info not found")

            if project_info.can_be_downloaded:
                print(f"Project info {project_info.dict()}")
                can_be_downloaded = True
            else:
                print("Waiting for 10 seconds ...")
        else:
            get_snapshots_response = client.projects.get_snapshots(
                project_id=project_id
            )

            if len(get_snapshots_response.snapshots) != 0:
                is_completed = True
                print("Snapshot found")
                snapshot = get_snapshots_response.snapshots[0]
            else:
                print("Waiting for 10 seconds ...")
                # wait for 10 seconds before checking the conversion progress
                sleep(10)

    print(f"Snapshot response:\n{snapshot.dict()}")

    response = client.projects.stream_audio(
        snapshot.project_id, snapshot.project_snapshot_id
    )

    # Create a BytesIO object to hold audio data
    audio_stream = BytesIO()

    # Write each chunk of audio data to the stream
    for chunk in response:
        if chunk:
            audio_stream.write(chunk)

    # Reset stream position to the beginning
    audio_stream.seek(0)

    # save to file
    print("Writing to example.mp3")
    save(audio_stream.read(), "example.mp3")

    audio_stream.seek(0)

    s3_filename = upload_audiostream_to_s3(audio_stream)
    presigned_url = generate_presigned_url(s3_filename)
    print(f"Signed URL to access the file: {presigned_url}")


if __name__ == "__main__":
    main()
