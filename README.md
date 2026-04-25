_This project has been created as part of the 42 curriculum by eala-lah, amakinen, gboggion, dvlachos, and yzhan._

# ft_transcendence: OmniPong

## Description

**OmniPong** is a full-stack web application centered around a custom-built 3D game engine. Instead of a basic 2D canvas, we built a physics-driven 3D environment using Three.js. It features custom gravity, spin mechanics, and continuous collision detection—meaning the engine draws a line to track the ball's exact path so it never teleports through a paddle, even at max speed.

Players can compete against each other in real-time or challenge a predictive AI. Outside of the game, the app includes a full user system where players can customize their profiles, track their match history, and manage friend lists simultaneously without database conflicts.

## Team Information

- **eala-lah (Product Owner & Developer):** Acted as PO. Built the entire 3D game from scratch, including the custom physics engine, the game logic, and the AI opponent. Handled the DevOps implementation, building the Docker containerization and network routing.
- **amakinen (Technical Lead / Architect):** Designed the overarching architecture and the Next.js App Router structure. Enforced code quality standards, managed the repository, and handled the strict server/client separation for the frontend.
- **gboggion (Project Manager / Scrum Master & Developer):** Managed the project timeline and team coordination. Built the user management and authentication systems with NextAuth, and co-developed the frontend UI.
- **dvlachos (Developer):** Handled the database architecture. Designed the MariaDB relational schema and implemented the Prisma ORM integration to manage match history and social features.
- **yzhan (Developer):** Co-developed the frontend UI, handling the Tailwind CSS styling and client-side components. Made sure the web elements layered cleanly over the 3D canvas and implemented the multi-language support.

## Project Management

- **Organization:** We used an Agile-inspired workflow. We broke down the mandatory 42 requirements and our chosen modules into distinct, assignable tasks.
- **Tools:** Everything was tracked systematically in GitHub Projects so we always knew who was working on what.
- **Communication:** We used Discord for daily coordination and asynchronous chat. Code integration was strictly managed via Pull Requests, and another member of the group had to review and approve the code before anything was merged into the main branch. We also held weekly meetings to track our progress.

## Technical Stack & Justifications

- **Frontend & Backend (Next.js - React 19):** Let us keep our backend APIs (Server Actions) and frontend UI in a single repository without needing to host a separate backend server.
- **3D Rendering (Three.js & React Three Fiber):** We needed a way to render 3D graphics in the browser. R3F lets us control 3D WebGL objects using standard React components, which kept our codebase organized.
- **Database (MariaDB & Prisma ORM):** MariaDB handles the relational data (like friend requests), and Prisma gave us strict TypeScript safety so we didn't have to write raw, error-prone SQL queries.
- **Authentication (NextAuth.js):** Handled the heavy lifting for secure logins, password hashing (bcrypt), and session tokens.
- **DevOps (Docker & Nginx):** Everything is containerized so it runs exactly the same on any machine, with Nginx acting as a reverse proxy over HTTPS.

## Database Schema

Our database is structured using Prisma and relies on a few core models:

- **User:** Stores core identity (`id`, `username`, `email`, password hash), profile customization (`displayName`, `avatarUrl`), and activity tracking.
- **Match:** Keeps a record of game history, storing `player1Id`, `player2` (which is a string to allow for AI/Guest names), `score1`, `score2`, and a `timestamp`.
- **Friendship:** A two-way relation table tracking `requesterId` and `addresseeId`, with a status enum (`PENDING` or `ACCEPTED`) to manage social connections.

## Features List

- **Advanced 3D Gameplay:** Fully playable 3D Pong with Classic and Advanced modes. _(eala-lah)_
- **Custom Physics Engine:** Runs a 120Hz sub-stepped loop (calculating the movement math multiple times instantly to catch up if the computer lags) and uses a Minkowski sum resolver (which instantly pushes the ball out of the 3D paddle if they overlap so it doesn't get stuck). _(eala-lah)_
- **Predictive AI:** An AI that actually calculates parabolic arcs to intercept the ball. _(eala-lah)_
- **User Management & Authentication:** Secure signup/login, profile customization, and session management. _(gboggion)_
- **Social Connections:** Users can send, accept, and manage friend requests. _(dvlachos, gboggion)_
- **Frontend UI/UX:** Responsive, component-driven client interface. _(yzhan, gboggion)_
- **DevOps Infrastructure:** Full containerization across App, DB, and Nginx proxy layers. _(amakinen, eala-lah)_
- **Internationalization:** Multi-language support across the UI. _(yzhan, gboggion)_

## Modules (18 Points Total)

### Major Modules (10 Points)

- **[Major] Web: Framework for Frontend & Backend (2 pts):** We used Next.js App Router for both our client-side UI and our backend API/Server Actions. _(amakinen, gboggion, yzhan)_
- **[Major] User Management: Standard User Management (2 pts):** Complete user lifecycle via NextAuth and Prisma, including secure authentication, avatars, and friend lists. _(gboggion, dvlachos)_
- **[Major] Gaming: Complete Web-Based Game (2 pts):** The core OmniPong game engine supporting competitive live play. _(eala-lah)_
- **[Major] Gaming: Advanced 3D Graphics (2 pts):** Built a full 3D arena using Three.js/React Three Fiber, including dynamic lighting and responsive cameras. _(eala-lah)_
- **[Major] AI: AI Opponent (2 pts):** Created an AI that dynamically calculates bounce arcs and simulates human-like errors based on difficulty settings, allowing solo play. _(eala-lah)_

### Minor Modules (8 Points)

- **[Minor] Web: Use an ORM (1 pt):** Integrated Prisma with the MariaDB adapter for secure schema migrations. _(dvlachos)_
- **[Minor] Web: Server-Side Rendering (SSR) (1 pt):** Leveraged Next.js to pre-render pages on the server for improved load times. _(amakinen, yzhan)_
- **[Minor] Web: Custom-made Design System (1 pt):** Built a reusable library of UI components customized with Tailwind CSS instead of using a pre-made template. _(yzhan, gboggion)_
- **[Minor] Accessibility: Multiple Languages (1 pt):** Integrated `i18next` to support English, Finnish, and Chinese across the app. _(yzhan, gboggion)_
- **[Minor] Accessibility: Additional Browsers (1 pt):** Verified the 3D WebGL context works across Chrome, Firefox, Safari, and Edge. _(Team)_
- **[Minor] User Management: Remote Authentication (1 pt):** Configured NextAuth to support third-party OAuth 2.0 login. _(gboggion)_
- **[Minor] User Management: Game Statistics & Match History (1 pt):** Tracks user match results in the database and displays them dynamically on user profiles. _(dvlachos, gboggion)_
- **[Minor] Gaming: Game Customization Options (1 pt):** A live settings panel where users can alter game gravity, ball speed, paddle friction, and arena colors. _(yzhan, eala-lah)_

## Instructions (How to Run)

**Prerequisites:**

- Docker and Docker Compose installed.
- Ports `80` (HTTP), `443` (HTTPS/8443), `3000` (App), and `3306` (MariaDB) must be available.

**Steps:**

1. Clone the repository: `git clone [repo_url]`
2. Navigate to the root: `cd ft_transcendence`
3. Create your environment file: `cp env.example .env` and configure your database credentials, NextAuth secret, etc.
4. Build and start the containers: `docker compose -f docker-compose.prod.yml up --build -d`
5. Access the application securely at: `https://localhost:8443` (or `http://localhost:8080`, which redirects to HTTPS).

## Resources & AI Usage

- **References:** We relied heavily on the official documentation for Next.js, Prisma, and Three.js/R3F.
- **AI Usage:** Per the curriculum guidelines, we used Large Language Models as debugging assistants and tutors. Instead of having AI write our core files, we used it to help explain complex 3D math (like formulating the `Math.exp()` decay logic for friction) and to quickly format boilerplate UI components. Every piece of logic was manually integrated, heavily refactored, and tested by the team.

## Individual Contributions & Challenges

- **eala-lah:** Built the game engine and DevOps. _Challenge:_ The ball was "tunneling" through the paddle at high speeds. _Solution:_ Researched and wrote a sub-stepped physics loop to catch up to lag, and used Relative-Velocity CCD (tracking the exact path of the ball) to mathematically guarantee the impact is registered before the frame updates.
- **amakinen:** Designed the backend architecture. _Challenge:_ Mixing Three.js with Next.js App Router. _Solution:_ Enforced strict component boundaries, keeping the 3D canvas purely on the client side (`"use client"`) while making sure database queries stayed securely in server actions.
- **gboggion:** Built the user/auth systems. _Challenge:_ Securely managing session state across the app. _Solution:_ Hooked NextAuth.js up with a Prisma adapter to handle secure, HTTP-only session tokens so users stay logged in across the game and dashboard.
- **dvlachos:** Designed the database. _Challenge:_ Structuring the social features. _Solution:_ Designed a dual-relation `Friendship` model in Prisma to accurately track requester vs. addressee states without creating duplicate database entries.
- **yzhan:** Built the frontend UI. _Challenge:_ Putting standard HTML menus over a 3D WebGL canvas that is constantly resizing caused layout breaks. _Solution:_ Utilized absolute-positioned Tailwind overlays that scale independently from the game screen underneath.
