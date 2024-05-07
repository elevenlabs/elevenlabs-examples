import os
import json
import uuid
import re
import threading
import signal

from flask import Flask, jsonify, make_response, Response
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from dataclasses import dataclass, asdict
from typing import List
from flask import request
from werkzeug.utils import secure_filename
from datetime import timedelta
from flask_cors import CORS


load_dotenv()

# setup elevenlabs

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

if not ELEVENLABS_API_KEY:
    raise ValueError("Missing ELEVENLABS_API_KEY")

if ELEVENLABS_API_KEY is None:
    print("Missing API KEY")
    raise Exception("MIssing API KEY")

client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

# helper function regarding dubbing


def upload_dubbing(id: str, source: str, target: str) -> str:
    f = open(f"data/{id}/raw.mp4", "rb")

    response = client.dubbing.dub_a_video_or_an_audio_file(
        mode="automatic",
        target_lang=target,
        source_lang=source if source != "detect" else None,
        file=(f"{id}.mp4", f.read(), "video/mp4"),
    )

    f.close()

    return response.dubbing_id


def get_metadata(dubbing_id: str):
    response = client.dubbing.get_dubbing_project_metadata(dubbing_id)

    return {
        "dubbing_id": response.dubbing_id,
        "status": response.status,
        "target_languages": response.target_languages,
    }


def download_dub(id: str, dubbing_id: str, language_code: str):
    with open(f"data/{id}/{language_code}.mp4", "wb") as w:
        for chunk in client.dubbing.get_dubbed_file(dubbing_id, language_code):
            w.write(chunk)


@dataclass
class ProjectData:
    id: str
    name: str
    dubbing_id: str
    status: str
    source_lang: str
    original_target_lang: str
    target_languages: List[str]

    def to_dict(self):
        return asdict(self)

    @staticmethod
    def from_dict(data):
        return ProjectData(**data)

    def save(self):
        with open(f"data/{self.id}/meta.json", "w") as w:
            w.write(json.dumps(self.to_dict()))


# setup scheduler for checking dubbing progress


CHECK_INTERVAL_SECONDS = 10


class ProgramKilled(Exception):
    pass


def signal_handler(signum, frame):
    raise ProgramKilled()


class Job(threading.Thread):
    def __init__(self, interval: timedelta):
        threading.Thread.__init__(self)
        self.daemon = False
        self.stopped = threading.Event()
        self.interval = interval

    def stop(self):
        self.stopped.set()
        self.join()

    def run(self):
        while not self.stopped.wait(self.interval.total_seconds()):
            dirs = [dir for dir in os.listdir("data") if os.path.isdir(f"data/{dir}")]

            data: List[ProjectData] = []

            for dir in dirs:
                with open(f"data/{dir}/meta.json", "r") as f:
                    raw = json.loads(f.read())
                    data.append(ProjectData.from_dict(raw))

            for project in data:
                if project.status == "dubbing":
                    new_meta = get_metadata(project.dubbing_id)
                    print(new_meta)

                    if new_meta["status"] != project.status:
                        project.status = new_meta["status"]
                        project.target_languages = new_meta["target_languages"]

                        if project.status == "failed":
                            continue

                        for target_lang in project.target_languages:
                            download_dub(project.id, project.dubbing_id, target_lang)

                        print(f"Saving dub result for {project.dubbing_id}")
                        project.save()


# setup server


app = Flask(__name__)

CORS(app)

ALLOWED_EXTENSIONS = {"mp4"}


def allowed_file(filename: str):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.after_request
def after_request(response):
    response.headers.add("Accept-Ranges", "bytes")
    return response


@app.route("/", methods=["GET"])
def hello_world():
    return "Hello, World!"


@app.route("/projects", methods=["GET"])
def projects():
    dirs = [dir for dir in os.listdir("data") if os.path.isdir(f"data/{dir}")]

    data = []

    for dir in dirs:
        with open(f"data/{dir}/meta.json", "r") as f:
            raw = json.loads(f.read())
            data.append(raw)

    return make_response(jsonify(data))


@app.route(
    "/projects/<id>",
)
def project_detail(id: str):
    f = open(f"data/{id}/meta.json", "r")
    data = json.loads(f.read())
    f.close()
    return make_response(jsonify(data))


@app.route("/projects/<id>/<lang_code>", methods=["GET"])
def stream(id: str, lang_code: str):
    video_path = f"data/{id}/{lang_code}.mp4"
    return Response(stream_video(video_path), mimetype="video/mp4")


def stream_video(video_path):
    with open(video_path, "rb") as video_file:
        while True:
            chunk = video_file.read(1024 * 1024)  # Read 1MB chunks of the video
            if not chunk:
                break
            yield chunk


@app.route("/projects", methods=["POST"])
def add_dubbing():
    if "file" not in request.files:
        return make_response("No file found", 400)

    file = request.files["file"]

    if file.filename is None or file.filename == "":
        return make_response("No file found", 400)

    filename = secure_filename(file.filename)

    source_lang = request.form.get("source_lang")

    if source_lang is None:
        return make_response("Invalid source lang", 400)

    target_lang = request.form.get("target_lang")

    if target_lang is None:
        return make_response("Invalid target lang", 400)

    id = uuid.uuid4().__str__()

    if not os.path.isdir(f"data/{id}"):
        os.mkdir(f"data/{id}")

    file.save(f"data/{id}/raw.mp4")

    dubbing_id = upload_dubbing(id, source_lang, target_lang)

    meta = ProjectData(
        id=id,
        name=filename,
        dubbing_id=dubbing_id,
        status="dubbing",
        source_lang=source_lang,
        original_target_lang=target_lang,
        target_languages=[target_lang],
    )

    meta.save()

    return make_response(jsonify(meta.to_dict()))


if __name__ == "__main__":
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)
    job = Job(interval=timedelta(seconds=CHECK_INTERVAL_SECONDS))
    job.start()

    try:
        app.run()
    except ProgramKilled:
        job.stop()
