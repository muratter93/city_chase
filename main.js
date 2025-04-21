let chatFlow = {};
const startNode = "start";

// メッセージ表示に関わる処理
function showMessage(text, senderLabel = "🚨本部:") {
  const chatBox = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.className = "chat-line";

  const isNarration = text.trim().startsWith("※");
  const messageBody = isNarration ? text.replace(/^※/, "").trim() : text;

  div.innerHTML = isNarration
    ? `<em>${messageBody}</em>`
    : `<strong>${senderLabel}</strong> ${messageBody}`;

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 選択肢に関わる処理
function showChoices(nodeKey) {
  const node = chatFlow[nodeKey];

  // クリア処理
  if (nodeKey === "clear") {
    alert("🎉 完全クリア!! プレイしてくれてありがとう!!");
    location.reload();
    return;
  }

  // ページ遷移
  if (node.link) {
    window.location.href = node.link;
    return;
  }

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  // 背景変更処理
  if (node.bg) {
    setBackground(node.bg);
  }

  const isNarration = node.message.trim().startsWith("※");
  showMessage(node.message, isNarration ? "" : "🚨本部:");

  // 選択肢ボタンの生成
  if (node.choices) {
    let i = 0;
    for (const [label, nextNode] of Object.entries(node.choices)) {
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.className = "choice-btn " + (i === 0 ? "red" : "blue");
      btn.style.animationDelay = `${i * 0.2}s`;
      btn.classList.add("show");
      btn.onclick = () => handleChoice(label, nextNode);
      choicesDiv.appendChild(btn);
      i++;
    }
  } else {
    // リスタートの処理
    const retryBtn = document.createElement("button");
    retryBtn.textContent = "「応答せよ!」";
    retryBtn.className = "choice-btn blue";
    retryBtn.onclick = () => showChoices(startNode);
    choicesDiv.appendChild(retryBtn);
  }

  // 最新の会話が常に下にくる処理
  setTimeout(() => {
    const chatBox = document.getElementById("chat-box");
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 10);
}

//　特殊な選択に関わる処理
function handleChoice(label, nextNodeKey) {
  const chatBox = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.className = "chat-line";
  div.innerHTML = `<strong>🕵️‍♂️警部:</strong> ${label}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  const nextNode = chatFlow[nextNodeKey];

  // 解除コードの処理
  if (nextNode.password) {
    const userInput = prompt("解除コードを入力せよ🔏");
    if (userInput === nextNode.password.correct) {
      showChoices(nextNode.password.success);
    } else {
      showChoices(nextNode.password.fail);
    }
  } else {
    setTimeout(() => {
      showChoices(nextNodeKey);
    }, 500);
  }
}

// 背景画像を切り替える
function setBackground(imageName) {
  document.body.style.backgroundImage = `url(${imageName})`;
}

// 最初に起動される、JSON 読み込み処理
fetch("chat.json")
  .then(response => response.json())
  .then(data => {
    chatFlow = data;
    showChoices(startNode);
  })
  // 例外処理
  .catch(error => {
    console.error("JSON読み込みエラー:", error);
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = "<div>読み込みに失敗しました。</div>";
  });

// 情報を持ち帰る演出
window.addEventListener("DOMContentLoaded", () => {
  const savedReport = localStorage.getItem("reportMessage");
  if (savedReport) {
    showMessage(savedReport, "🕵️‍♂️警部");
    localStorage.removeItem("reportMessage");
  }
});
