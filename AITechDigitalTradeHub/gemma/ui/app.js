const $ = (id) => document.getElementById(id);
const messages = [];
let ready = false;
let busy = false;
let lastLogs = "";

function toast(text) {
  $("toast").textContent = text;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 2600);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    let detail = "خطایی رخ داد.";
    try { detail = (await response.json()).detail || detail; } catch {}
    throw new Error(detail);
  }
  return response;
}

function setStatus(status) {
  ready = status.ready;
  const active = status.operation;
  const dot = $("statusDot");
  dot.className = `dot ${ready ? "online" : active ? "loading" : "offline"}`;
  $("statusText").textContent = ready ? "مدل آماده است" : active === "setup" ? "در حال نصب" : active === "model" ? "در حال بارگذاری" : "مدل خاموش است";
  $("statusHint").textContent = ready ? "آماده دریافت پیام" : active ? "جزئیات را در لاگ ببینید" : "موتور مدل فعال نیست";
  $("startBtn").disabled = ready || Boolean(active) || !status.installed;
  $("stopBtn").disabled = !ready && active !== "model";
  $("setupBtn").classList.toggle("hidden", status.installed || Boolean(active));
  $("prompt").disabled = !ready || busy;
  $("sendBtn").disabled = !ready || busy;
  $("composerHint").textContent = ready ? "Enter برای ارسال · Shift+Enter خط جدید" : active ? "مدل در حال آماده‌سازی است..." : "ابتدا مدل را اجرا کنید";
  const ragStatus = $("ragStatus");
  ragStatus.textContent = status.rag_ready ? "RAG آی‌تک آماده است" : "RAG خاموش است";
  ragStatus.className = `rag-status ${status.rag_ready ? "online" : "offline"}`;

  const gpu = status.gpu || {};
  if (gpu.name) {
    $("gpuName").textContent = gpu.name;
    $("gpuTemp").textContent = `${gpu.temperature}°`;
    $("gpuMemory").textContent = `${(gpu.used / 1024).toFixed(1)} / ${(gpu.total / 1024).toFixed(1)} GB`;
    $("gpuMemoryBar").style.width = `${gpu.used / gpu.total * 100}%`;
    $("gpuUtil").textContent = `${gpu.utilization}%`;
    $("gpuUtilBar").style.width = `${gpu.utilization}%`;
  }
}

async function refreshStatus() {
  try {
    const response = await api("/api/status");
    setStatus(await response.json());
  } catch {
    $("statusText").textContent = "ارتباط قطع است";
  }
}

async function refreshLogs() {
  if (!$("logDrawer").classList.contains("open")) return;
  try {
    const response = await api("/api/logs");
    const text = (await response.json()).lines.join("\n") || "هنوز لاگی ثبت نشده است.";
    if (text !== lastLogs) {
      lastLogs = text;
      $("logs").textContent = text;
      $("logs").scrollTop = $("logs").scrollHeight;
    }
  } catch {}
}

async function startModel() {
  try {
    const contextLength = Number($("contextLength").value);
    await api("/api/model/start", {
      method: "POST",
      body: JSON.stringify({ context_length: contextLength, gpu_memory: 0.92 }),
    });
    toast("بارگذاری مدل شروع شد");
    $("logDrawer").classList.add("open");
    refreshStatus();
  } catch (error) { toast(error.message); }
}

async function setup() {
  try {
    await api("/api/setup", { method: "POST" });
    toast("نصب vLLM شروع شد");
    $("logDrawer").classList.add("open");
    refreshStatus();
  } catch (error) { toast(error.message); }
}

async function stopModel() {
  try {
    await api("/api/model/stop", { method: "POST" });
    toast("مدل متوقف شد");
    refreshStatus();
  } catch (error) { toast(error.message); }
}

function addMessage(role, text = "") {
  $("welcome")?.remove();
  const row = document.createElement("div");
  row.className = `message ${role}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  row.appendChild(bubble);
  $("messages").appendChild(row);
  $("messages").scrollTop = $("messages").scrollHeight;
  return bubble;
}

async function sendMessage(text) {
  if (!text.trim() || busy || !ready) return;
  busy = true;
  $("prompt").value = "";
  resizePrompt();
  addMessage("user", text);
  messages.push({ role: "user", content: text });
  const bubble = addMessage("assistant");
  bubble.classList.add("cursor");
  let answer = "";
  let reasoning = "";
  setStatus({ ready, installed: true, operation: null, gpu: {} });

  try {
    const response = await api("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages,
        temperature: Number($("temperature").value),
        max_tokens: Number($("maxTokens").value),
        use_rag: $("ragToggle").checked,
      }),
    });
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop();
      for (const event of events) {
        const line = event.split("\n").find((item) => item.startsWith("data:"));
        if (!line) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") continue;
        const chunk = JSON.parse(data);
        if (chunk.error) throw new Error(chunk.error);
        answer += chunk.text || "";
        reasoning += chunk.reasoning || "";
        bubble.textContent = answer || (reasoning ? "در حال فکر کردن..." : "");
        if (chunk.rag) {
          bubble.dataset.rag = "true";
          const route = chunk.rag_meta?.route || "rag";
          const retrieval = chunk.rag_meta?.retrieval_ms;
          bubble.title = `RAG آی‌تک · ${route} · ${retrieval ?? chunk.elapsed_ms} ms`;
        }
        if (reasoning && answer) bubble.title = reasoning;
        $("messages").scrollTop = $("messages").scrollHeight;
      }
    }
    messages.push({ role: "assistant", content: answer });
  } catch (error) {
    bubble.textContent = `خطا: ${error.message}`;
  } finally {
    bubble.classList.remove("cursor");
    busy = false;
    refreshStatus();
    $("prompt").focus();
  }
}

function resizePrompt() {
  const prompt = $("prompt");
  prompt.style.height = "auto";
  prompt.style.height = `${Math.min(prompt.scrollHeight, 160)}px`;
}

$("startBtn").addEventListener("click", startModel);
$("stopBtn").addEventListener("click", stopModel);
$("setupBtn").addEventListener("click", setup);
$("temperature").addEventListener("input", () => $("temperatureValue").textContent = $("temperature").value);
$("prompt").addEventListener("input", resizePrompt);
$("prompt").addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    $("composer").requestSubmit();
  }
});
$("composer").addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage($("prompt").value);
});
$("clearBtn").addEventListener("click", () => {
  messages.length = 0;
  $("messages").innerHTML = `<div id="welcome" class="welcome"><div class="orb">G</div><h3>گفتگوی تازه آماده است.</h3><p>هر موضوعی که دوست دارید مطرح کنید.</p></div>`;
});
document.querySelectorAll(".suggestions button").forEach((button) => {
  button.addEventListener("click", () => sendMessage(button.textContent));
});
$("logToggle").addEventListener("click", () => $("logDrawer").classList.add("open"));
$("closeLogs").addEventListener("click", () => $("logDrawer").classList.remove("open"));

refreshStatus();
setInterval(refreshStatus, 3000);
setInterval(refreshLogs, 1200);
