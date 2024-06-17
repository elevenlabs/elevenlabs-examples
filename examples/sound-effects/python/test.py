import os

from main import generate_sound_effect


def test_generate_sound_effect():
    FILE_PATH = "output.mp3"

    os.remove(FILE_PATH) if os.path.exists(FILE_PATH) else None
    assert not os.path.exists(FILE_PATH)

    generate_sound_effect("Dog barking", FILE_PATH)

    assert os.path.exists(FILE_PATH)
    assert os.path.getsize(FILE_PATH) > 0

    # cleanup
    os.remove(FILE_PATH)
