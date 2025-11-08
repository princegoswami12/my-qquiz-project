const generateBtn = document.getElementById("generateBtn");
const quizContainer = document.getElementById("quizContainer");
const result = document.getElementById("result");
const retryBtn = document.getElementById("retryBtn");
const loading = document.getElementById("loading");

generateBtn.addEventListener("click", generateQuiz);
retryBtn.addEventListener("click", resetQuiz);

async function generateQuiz() {
  const topicSelect = document.getElementById("topicSelect").value;
  const customTopic = document.getElementById("customTopic").value.trim();
  const numQuestions = document.getElementById("numQuestions").value || 3;

  const topic = customTopic || topicSelect;
  if (!topic) {
    alert("Please select or enter a topic!");
    return;
  }

  quizContainer.innerHTML = "";
  result.innerHTML = "";
  retryBtn.style.display = "none";
  loading.style.display = "block";

  try {
    // ⚠️ Replace with your own API key (for local use only)
    const API_KEY = "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";

    const prompt = `Create a ${numQuestions}-question multiple-choice quiz about "${topic}".
    Format the output as pure JSON like this:
    [
      {
        "question": "Question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "Option B",
        "explanation": "Short reason why this is correct."
      }
    ]`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const quizText = data.choices[0].message.content;

    // Clean and parse AI output
    const cleanText = quizText.replace(/```json|```/g, "").trim();
    const quiz = JSON.parse(cleanText);

    displayQuiz(quiz);
  } catch (err) {
    console.error(err);
    quizContainer.innerHTML = "<p>⚠️ Failed to generate quiz. Try again.</p>";
  } finally {
    loading.style.display = "none";
  }
}

function displayQuiz(quiz) {
  quizContainer.innerHTML = "";
  let score = 0;

  quiz.forEach((q, index) => {
    const div = document.createElement("div");
    div.classList.add("question");

    div.innerHTML = `
      <p><b>Q${index + 1}:</b> ${q.question}</p>
      <div class="options">
        ${q.options.map(opt => `<button class="option-btn">${opt}</button>`).join("")}
      </div>
      <p class="explanation" style="display:none">${q.explanation}</p>
    `;

    quizContainer.appendChild(div);

    const optionButtons = div.querySelectorAll(".option-btn");
    optionButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.textContent === q.answer) {
          btn.style.background = "#28a745";
          btn.style.color = "#fff";
          score++;
        } else {
          btn.style.background = "#dc3545";
          btn.style.color = "#fff";
        }

        // Disable all options
        optionButtons.forEach(b => (b.disabled = true));
        div.querySelector(".explanation").style.display = "block";

        result.innerHTML = `<h3>Score: ${score}/${quiz.length}</h3>`;
      });
    });
  });

  retryBtn.style.display = "block";
}

function resetQuiz() {
  quizContainer.innerHTML = "";
  result.innerHTML = "";
  retryBtn.style.display = "none";
  document.getElementById("topicSelect").value = "";
  document.getElementById("customTopic").value = "";
}
