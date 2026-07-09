import json
import sys
import time
import urllib.request


sys.stdout.reconfigure(encoding="utf-8")


def ask(text: str) -> None:
    payload = json.dumps(
        {
            "messages": [{"role": "user", "content": text}],
            "stream": False,
        },
        ensure_ascii=False,
    ).encode("utf-8")
    request = urllib.request.Request(
        "http://127.0.0.1:8003/v1/chat/completions",
        data=payload,
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    started = time.perf_counter()
    with urllib.request.urlopen(request, timeout=120) as response:
        body = json.load(response)
    elapsed = time.perf_counter() - started
    answer = body["choices"][0]["message"]["content"]
    print(f"{elapsed:.2f}s | {text} => {answer}")


ask("شماره تماس آیتک چیست؟")
ask("آخرین رویداد آیتک چیست؟")
ask("آخرین رویداد آیتک چیست؟")
