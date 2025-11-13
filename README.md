🌲 Forest Friends - Social Skills Helper

A safe place for kids to practice talking and making friends, built with love for my brother.

Live Demo: [[AI_BOT](https://autism-social-coach-frontend.pages.dev/)]

💚 Why I Built This
I have a younger brother with autism, and watching him navigate social situations inspired me to create something that could help. He loves the color green and anything related to forests and nature.
Sometimes, practicing conversations can feel stressful - worrying about saying the wrong thing or not understanding what someone means. I wanted to build a space where he (and other kids like him) could practice without any pressure. No judgment. No rush. Just a patient friend who's always there to listen and help.
This app is my way of combining what I love (building things with code) with what matters most (helping my brother feel more confident talking with others).

🦊 What This Does
Forest Friends is a chat app where kids can:

Practice saying hello - Learn different ways to greet people
Talk about feelings - Put words to emotions in a safe way
Ask questions - Get comfortable with back-and-forth conversations
Share interests - Talk about things they love without feeling awkward

The app remembers progress and celebrates wins with fun forest badges. Every small step forward gets recognized because every step matters.

🎯 How It Helps Kids with Autism
Kids on the spectrum often benefit from:

Predictable patterns - The app responds consistently, no surprises
Clear, simple language - No confusing idioms or sarcasm
Visual feedback - Progress bars and badges show growth clearly
Safe practice space - No real-world pressure, practice at your own pace
Patience - The AI never gets tired or frustrated

My brother struggles with abstract language and unexpected changes in conversation. This app keeps things concrete and steady, which helps him feel more comfortable.

🌳 The Forest Theme
The green forest theme isn't just decoration - it's intentional. My brother finds nature calming, and green is his favorite color. When he's overwhelmed, going outside or looking at trees helps him reset.
I wanted the app to feel like a peaceful walk in the woods - somewhere safe and familiar where he can be himself.

🛠️ How I Built It
I used Cloudflare's platform because it met all the technical requirements for the assignment, but more importantly, it let me build something that actually works and can scale.
Tech stack:

Cloudflare Workers - Runs the backend
Workers AI (Llama 3.3) - Powers the conversations
Durable Objects - Remembers each kid's progress
Cloudflare Pages - Hosts the forest-themed interface

The AI is prompted specifically to use literal, simple language and avoid things that confuse kids with autism (like idioms, sarcasm, or abstract concepts).

🎨 Design Choices
Everything about the design considers how my brother (and kids like him) experience the world:

Forest animals as progress icons - More engaging than generic checkmarks
Green color palette - Calming and familiar
Large, clear buttons - Easy to see and click
Consistent layout - Nothing moves around unexpectedly
Simple animations - Fun but not overwhelming
Clear visual progress - You can SEE yourself improving


📊 Sample Conversation
Forest Friend: Hi there! I'm your forest friend. What's your name?

User: Tommy

Forest Friend: Nice to meet you, Tommy! How old are you?

User: 8

Forest Friend: Cool! I'm here to practice talking. 
             Want to practice saying hello or talking about feelings?

User: Saying hello

Forest Friend: Great choice! Let's practice. 
              Hello Tommy! How are you today?

User: Hello! I'm good

Forest Friend: Awesome! You did a really good job saying hello back.
              [🦊 Badge Earned: First Hello!]

🚀 Running It Yourself
If you want to run this for your own family member:
bash# Clone it
git clone https://github.com/YOUR-USERNAME/autism-social-coach.git
cd autism-social-coach

# Install stuff
npm install

# Login to Cloudflare (one-time setup)
wrangler login

# Test it locally
wrangler dev

# Deploy it
wrangler deploy
wrangler pages deploy frontend --project-name=forest-friends


🌱 What's Next
Ideas I'd like to add:

More forest animals - Different animals could teach different skills
Voice option - Some kids prefer talking over typing
Parent view - Let parents see weekly progress without interrupting practice
Story mode - Practice conversations in the context of forest adventures
Calming exercises - When things feel overwhelming, guided breathing with forest sounds



- [`agents`](https://github.com/cloudflare/agents/blob/main/packages/agents/README.md)
- [Cloudflare Agents Documentation](https://developers.cloudflare.com/agents/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)

## License

MIT
