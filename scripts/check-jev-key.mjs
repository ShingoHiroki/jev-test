const key = process.env.TYPESAFE_API_KEY?.trim();
if (!key) {
  console.log("TYPESAFE_API_KEY is not set");
  process.exit(0);
}

const response = await fetch("https://api.typesafe.ai/v1/systemone", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "jev-latest",
    state: "GitHub Actions connectivity check",
    questions: {
      ping: {
        type: "noul",
        instructions: "Is this a connectivity check?",
      },
    },
  }),
});

if (!response.ok) {
  const detail = await response.text();
  console.error(`Jev key check failed (${response.status}): ${detail}`);
  process.exit(1);
}

const payload = await response.json();
console.log(`Jev key ok; model=${payload.model ?? "unknown"}`);
