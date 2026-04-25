_This project has been created as part of the 42 curriculum by eala-lah, amakinen, gboggion, dvlachos, and yzhan._

# ft_transcendence: OmniPong

## Description

**OmniPong** is a full-stack web application centered around a 3D browser-based game. Instead of a basic 2D canvas, we built a 3D environment using Three.js with custom physics to ensure smooth, reliable gameplay.

Players can compete against each other in real-time or challenge an AI. Outside of the game arena, the application functions as a social platform. It includes a comprehensive user management system where players can customize their profiles, track their match history and manage social connections and friend requests.

## Team Information

- **eala-lah (Product Owner & Developer):** Acted as PO, defining the product vision. Built the 3D game environment, game logic, and AI opponent. Handled the DevOps infrastructure, configuring the Docker containerization and network routing.
- **amakinen (Technical Lead / Architect & Developer):** Designed the overarching architecture and the Next.js App Router structure. Enforced code quality standards, managed the repository.
- **gboggion (Project Manager / Scrum Master & Developer):** Managed scheduling, tracked deadlines, and facilitated team coordination. Built the complete authentication flow (NextAuth credentials & GitHub OAuth), user profile/settings pages, and legal pages, while ensuring responsive design. Managed testing and PR reviews.
- **dvlachos (Developer):** Handled the database architecture and backend Server Actions. Designed the MariaDB relational schema and implemented the Prisma ORM integration. Contributed to the settings page, avatar management, online status tracking, and parts of the friend profile and registration flows.
- **yzhan (Developer):** Collaborated on frontend feature planning and designed the overall layout and color scheme using Figma. Implemented the core layout, homepage, friend page, game setup, and game interface. Also implemented the language translation (i18n) feature and dark mode support.

## Project Management

- **Organization:** We utilized an Agile-inspired workflow, breaking down the subject requirements and our chosen modules into distinct, assignable tasks.
- **Tools:** Task tracking, backlog prioritization, and issue management were handled systematically using **GitHub Projects**.
- **Communication:** We used **Discord** for daily coordination, scheduling, and asynchronous chat. Code integration was strictly managed via Pull Requests requiring peer review before merging into the main branch. We also held weekly live meetings to track progress and unblock dependencies.

## Technical Stack & Justifications

- **Frontend & Backend (Next.js - React 19):** Using a meta-framework allowed us to keep our backend APIs (Server Actions) and frontend UI in a single repository without needing to host and bridge a separate backend server.
- **3D Rendering (Three.js & React Three Fiber):** React Three Fiber allowed us to control 3D WebGL objects using standard React components, which kept our game codebase organized and native to our frontend stack.
- **Database (MariaDB & Prisma ORM):** MariaDB efficiently handles our relational data (like mutual friend requests). Prisma was chosen because it provides strict TypeScript safety, preventing raw SQL injection vulnerabilities and catching schema errors at compile time.
- **Authentication (NextAuth.js):** Implements unified session management for multiple login options, and provides third-party OAuth logins (GitHub).
- **DevOps (Docker & Nginx):** Containerization guarantees the app runs identically across all development and production environments. Nginx acts as a HTTPS termination reverse.

## Database Schema

Our database is structured using Prisma and relies on three core relational models:

- **User:** Stores core identity (`id` UUID, `email` String, `password` String Hash), profile customization (`displayName` String, `bio` String, `avatarData` Bytes), and tracks activity.
- **Match:** Keeps a record of game history, storing `player1Id` (UUID foreign key), `player2` (String, to accommodate AI or Guest names), `score1` (Int), `score2` (Int), and a `timestamp` (DateTime).
- **Friendship:** A two-way relation table tracking `requesterId` (UUID) and `addresseeId` (UUID), utilizing a status Enum (`PENDING` or `ACCEPTED`) to manage social connections without duplicating entries.

## Features List

- **Advanced 3D Gameplay:** Fully playable 3D Pong with customizable settings and smooth collision logic. _(eala-lah)_
- **Predictive AI:** A responsive AI opponent that anticipates the ball's trajectory for solo play. _(eala-lah)_
- **User Management & Authentication:** Secure signup/login, profile customization, and session management. _(gboggion, dvlachos)_
- **Social Connections:** Users can send, accept, and manage friend requests dynamically. _(dvlachos, gboggion, yzhan)_
- **Frontend UI/UX:** Responsive, component-driven client interface with dark mode. _(yzhan, gboggion)_
- **DevOps Infrastructure:** Full containerization across App, DB, and Nginx proxy layers. _(amakinen, eala-lah)_
- **Internationalization:** Multi-language support across the UI. _(yzhan, gboggion)_

## Modules (18 Points Total)

### Major Modules (10 Points)

- **[Major] Web: Framework for Frontend & Backend (2 pts):** Implemented Next.js App Router to handle both client-side UI rendering and backend API/Server Actions. _(amakinen, gboggion, yzhan)_
- **[Major] User Management: Standard User Management (2 pts):** Built a complete user lifecycle via NextAuth and Prisma, managing secure authentication, avatar uploads, and relational friend lists. _(gboggion, dvlachos)_
- **[Major] Gaming: Complete Web-Based Game (2 pts):** Developed the core OmniPong game engine supporting competitive live play with win/loss conditions. _(eala-lah)_
- **[Major] Gaming: Advanced 3D Graphics (2 pts):** Built a full 3D arena using Three.js/React Three Fiber, implementing dynamic lighting, shadows, and responsive cameras. _(eala-lah)_
- **[Major] AI: AI Opponent (2 pts):** Created an AI that dynamically tracks the ball and simulates human-like errors based on difficulty settings, allowing solo play. _(eala-lah)_

### Minor Modules (8 Points)

- **[Minor] Web: Use an ORM (1 pt):** Integrated Prisma with the MariaDB adapter for secure schema migrations and type-safe database queries. _(dvlachos)_
- **[Minor] Web: Server-Side Rendering (SSR) (1 pt):** Leveraged Next.js to pre-render React components on the server for improved load times and SEO. _(amakinen, yzhan)_
- **[Minor] Web: Custom-made Design System (1 pt):** Built a reusable library of UI components (buttons, modals, inputs) heavily customized with Tailwind CSS rather than using a pre-made template library. _(yzhan, gboggion)_
- **[Minor] Accessibility: Multiple Languages (1 pt):** Integrated `i18next` to support English, Finnish, and Chinese across the app, including a UI language switcher. _(yzhan, gboggion)_
- **[Minor] Accessibility: Additional Browsers (1 pt):** Verified the 3D WebGL context and UI flexbox layouts work consistently across Chrome, Firefox, Safari, and Edge. _(Team)_
- **[Minor] User Management: Remote Authentication (1 pt):** Configured NextAuth to support third-party OAuth 2.0 login via GitHub. _(gboggion)_
- **[Minor] User Management: Game Statistics & Match History (1 pt):** Tracks user match results in the MariaDB database and displays them dynamically on user profiles. _(dvlachos, gboggion)_
- **[Minor] Gaming: Game Customization Options (1 pt):** Created a live settings panel where users can alter game physics (gravity, ball speed) and visual themes. _(yzhan, dvlachos, eala-lah)_

## Instructions (How to Run)

**Prerequisites:**

- Docker and Docker Compose installed.
- Port `8443` must be available on your machine. This is used instead of 443 to demonstrate the project without requiring low port privileges.
- Port `8080` is also used to demonstrate that we redirect non-HTTP traffic to HTTPS.

**Steps:**

1. Clone the repository: `git clone [repo_url]`
2. Navigate to the root folder: `cd ft_transcendence`
3. Create your environment file: `cp env.example .env`. Fill in your GitHub OAuth application credentials and generate a random secret for NextAuth.
4. Build and start the containers: `docker compose -f docker-compose.prod.yml up --build -d`
5. Access the application securely at: `https://localhost:8443` (or `http://localhost:8080`, which will redirect to HTTPS).

## Resources & AI Usage

- **References:** We relied heavily on the official documentation for Next.js, Prisma, and React Three Fiber.
- **AI Usage:** Per the curriculum guidelines, we used Large Language Models (ChatGPT/Claude) primarily as debugging assistants and tutors. Instead of having AI generate our core architecture, we used it to help explain framework-specific concepts (like Next.js server-action data mutations) and to format boilerplate UI components. Every piece of logic was manually integrated, heavily refactored, peer-reviewed, and tested by the team to ensure complete understanding.

## Individual Contributions & Challenges

- **eala-lah:** Built the game engine and DevOps infrastructure.
  - _Challenge:_ Ensuring smooth gameplay and accurate hit registration at high speeds in a browser environment.
  - _Solution:_ Refined the collision logic and standard game loop to ensure the ball correctly interacts with the paddles without dropping frames or clipping through objects.
- **amakinen:** Made decisions on the libraries and frameworks used, designed the logical organization of the project. Guided team with Git usage and enforced code quality standard, and helped troubleshoot complex issues.
  - _Challenge:_ Enforcing strict standards and teaching best practices would often delay pull requests as they went through multiple rounds of reviews.
  - _Solution:_ Focus on major issues only, accept functional code even if it's not perfect, and provide suggestions or implement minor cleanups afterwards.
- **gboggion:** Managed project timelines, built the authentication flows (OAuth + Credentials), and developed user profile/settings/legal pages.
  - _Challenge:_ Managing diverse team communication styles, scheduling conflicts, and feature interdependencies creating bottlenecks.
  - _Solution:_ Addressed communication dynamics in open team meetings, organized shared live-working sessions to supplement async chat, and flagged blocking dependencies early to redirect effort toward parallel tasks.
- **dvlachos:** Designed the database, Prisma ORM, and backend data actions for settings, avatars, and online status.
  - _Challenge:_ Structuring complex social features and securely bridging backend data with frontend components.
  - _Solution:_ Designed a dual-relation `Friendship` model in Prisma to accurately track requester vs. addressee states without duplicating entries, and wrote robust Server Actions to connect the UI to the database safely.
- **yzhan:** Designed the Figma layout and built the frontend UI (homepage, game setup, i18n, dark mode).
  - _Challenge:_ Adapting to a new tech stack required extra learning time, and overlaying standard HTML menus on a resizing 3D canvas caused layout breaks.
  - _Solution:_ Relied on teammate guidance to learn the stack rapidly, prioritized core functionality over endless UI refinement to meet deadlines, and utilized absolute-positioned Tailwind overlays that scale independently from the 3D canvas underneath.
