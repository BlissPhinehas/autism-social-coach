````markdown
# Autism Social Coach

A personalized social skills and learning assistant for children, built using Cloudflare Workers and AI models. This project was inspired by my brother, who is autistic, and aims to provide supportive, interactive, and engaging experiences for children through games, storytelling, praise, and emotional guidance.

---

## Features

- **Number Game** – Fun and simple math exercises that reward stars for correct answers.  
- **Story Time** – Generates short child-friendly stories based on the child’s interests.  
- **Morning Routine** – Encourages children to complete daily activities with positive reinforcement.  
- **Feelings Support** – Helps children express their emotions and acknowledges them.  
- **Praise System** – Rewards progress and good behavior with stars.  

---

## Tech Stack

- **Cloudflare Workers & Durable Objects** – For serverless stateful backend.  
- **Llama 3.3 (Meta AI)** – Provides conversational responses and storytelling.  
- **TypeScript** – For strong typing and maintainable code.  
- **Vite** – For frontend bundling (if applicable).  

---

## Getting Started

1. Clone the repo:

```bash
git clone https://github.com/your-username/autism-social-coach.git
cd autism-social-coach
````

2. Install dependencies:

```bash
npm install
```

3. Set environment variables:

```bash
cp .dev.vars.example .dev.vars
# then edit .dev.vars to include your AI keys
```

4. Build and type-check:

```bash
npx tsc --noEmit
```

5. Start the Worker locally:

```bash
npm run dev
```

---

## Live Demo

[https://autism-social-coach-frontend.pages.dev/]

---

## References

* Starter template: [Cloudflare Agents Starter](https://github.com/cloudflare/agents-starter)
* Cloudflare Workers logs and observability: [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)

---

## Why I Built This

I decided to build this project because my brother is autistic. I wanted to create a safe and fun environment that encourages learning, emotional expression, and daily routine practice while giving positive reinforcement.

---

## License

MIT

```
