# 10. System Design, Scenarios & Leadership

At 8 years, expect questions about design decisions, trade-offs, mentoring, and how you handle conflict and delivery risk.

### Q1. Design a large enterprise admin dashboard in Angular with a Java backend. How would you approach it? `Architect`

> **Like I'm 5:** Start by asking what users need, then sketch the parts, the rules, and the risks, like planning a house before building it.

**Answer:** I would clarify requirements first: number of users, number of screens, data volume, offline needs, and accessibility requirements.

- **Frontend**: Angular workspace (Nx is a good fit for multiple apps and libraries), feature-based lazy routes, a design-system library with shared components, and a `data-access` layer per feature with signals or NgRx.
- **Backend**: Spring Boot services for each bounded context, a BFF (backend for frontend) if the dashboard aggregates many services, pagination and filtering on the server, and caching for expensive reports.
- **Contract**: OpenAPI-first, generated TypeScript client, and contract tests.
- **Non-functional**: RBAC enforced on the backend, audit logs, observability with correlation IDs, performance budgets, and WCAG accessibility checks.
- **Delivery**: CI with per-PR preview environments, feature flags, and canary releases.

I would also ask what can go wrong (slow reports, unclear permissions) and what the team can support.

---

### Q2. What are micro-frontends, and when would you use Module Federation? `Architect`

> **Like I'm 5:** Micro-frontends are many small kitchens making one meal. Module Federation lets them share pots. Only do this when many teams need it.

**Answer:** Micro-frontends split a large UI into independently deployed parts owned by different teams. Webpack and Rspack **Module Federation** lets an Angular shell load remote Angular apps at runtime, with shared dependencies such as Angular and RxJS as singletons.

**When to use:** many teams working on one product, with independent release cycles.
**When not to use:** a small team or a single product. It adds version management, shared-library conflicts, and runtime complexity. A well-structured monolith with lazy-loaded features is often better.

---

### Q3. Design a real-time notification system for the user's browser. `Architect`

> **Like I'm 5:** The server sends a message when something happens, and the browser listens on one connection. Number the messages, so the browser can catch up after a drop.

**Answer:**
- **Backend**: events are published by domain services to a message broker (Kafka or RabbitMQ). A notification service consumes them, stores them for history, and pushes them to connected clients with SSE or WebSocket.
- **Frontend**: a single connection per browser tab, shared via `BroadcastChannel` so multiple tabs do not open multiple connections.
- **Reliability**: sequence numbers or event IDs, so the client can request missed events after reconnecting. Read state and unread count come from the REST API on startup.
- **Scale**: stateless notification pods with sticky sessions or a pub/sub layer (Redis) so any pod can deliver to any user.

---

### Q4. How do you handle session timeout across multiple browser tabs? `Advanced`

> **Like I'm 5:** Warn the user before the session ends. Tabs talk to each other, so logging out in one logs out in all.

**Answer:**
- Refresh the access token silently before it expires. Use an interceptor and a single refresh call (see the routing section).
- Use `BroadcastChannel` or `storage` events to tell other tabs about logout or token refresh, so one tab logging out logs out all tabs.
- Show a warning dialog a few minutes before session expiry with an option to extend.
- On the server, use idle and absolute session timeouts, and invalidate refresh tokens on logout.

---

### Q5. How would you implement optimistic UI for a drag-and-drop Kanban board? `Architect`

> **Like I'm 5:** Move the card on the screen first, then tell the server. If the server says no, move it back. Version numbers catch two people editing at once.

**Answer:** Move the card in the UI first, then send a `PATCH` with the new position and status. Keep the previous state for rollback. For conflicts (two users move the same card), use a version field (`ETag` or `version` in the body) and handle `409 Conflict` by reloading the card and showing a message. Use a fractional index for ordering, so a move changes only one row on the server and not the whole column.

---

### Q6. A page takes 8 seconds to load in production, but it is fast locally. How do you diagnose it? `Advanced`

> **Like I'm 5:** Use a stopwatch to find the slow part. Check the network, the server, and the database, and fix the biggest problem first.

**Answer:**
1. **Measure**: Chrome DevTools performance panel and Network tab with throttling; check the real user data in RUM.
2. **Separate frontend and backend**: is the API slow (check server traces, slow SQL), or is the bundle or render slow?
3. **Check the data**: production has more rows than local. Look for N+1 queries in Hibernate (use `spring.jpa.open-in-view=false` and `@EntityGraph` or fetch joins), and large payloads.
4. **Check the environment**: CDN not caching, no compression, cold starts in serverless, or a distant region.
5. **Fix and verify**: fix the largest contributor first, add a performance budget, and re-measure in production.

---

### Q7. How would you migrate a large AngularJS (1.x) app to modern Angular? `Architect`

> **Like I'm 5:** Move one screen at a time. Keep the old and new versions working side by side, and test the old rules before you change them.

**Answer:** Use the **hybrid, incremental** approach with `@angular/upgrade`.
1. Set up the new Angular app alongside the old one, and bootstrap both in a hybrid app.
2. Migrate **leaf components** first (small, reusable UI), then services, then routes.
3. Keep both running behind the same router during the transition, and use feature flags to switch screens.
4. Add tests for the old behavior before rewriting it, because the old app often has undocumented business rules.
5. Track progress with a measurable goal: percentage of screens migrated, and remove the old code as soon as a module is done.

---

### Q8. How do you decide between building a feature in the frontend or the backend? `Architect`

> **Like I'm 5:** Rules about money or safety go on the server. Looks and small helpers go in the frontend.

**Answer:** Put business rules and anything that must be trusted (pricing, permissions, calculations that affect money) on the backend. Put presentation logic and UX-only behavior (sorting open panels, local filters, validation hints) on the frontend. If the same rule is needed in both places, the backend is the source of truth and the frontend uses the result.

---

### Q9. Tell me about a time you improved the performance of a full stack application. `Behavioral / Core`

> **Like I'm 5:** Tell a story: what was the problem, what you did, and what changed. Use real numbers.

**Answer structure (STAR):**
- **Situation**: for example, "the order list took 6 seconds for large customers".
- **Task**: target load time and the constraint (no big rewrite before a release).
- **Action**: profiled the query and found N+1 queries in JPA. Added fetch joins, changed the Angular list to server-side paging, and used `OnPush` with `track` in the list.
- **Result**: load time dropped from 6 seconds to under 1 second, with numbers from your monitoring.

**Tip:** Prepare 3–4 stories from your 8 years: a production incident, a performance win, a difficult technical decision, and a mentoring example.

---

### Q10. How do you mentor junior and mid-level developers on Angular? `Leadership`

> **Like I'm 5:** Teach by reviewing code with reasons, working together, and letting people own small pieces.

**Answer:**
- Code reviews focused on reasons, not only style. Link to the Angular docs or a team guideline.
- Pair on the first feature so the junior sees the team's patterns (feature structure, error handling, testing).
- Maintain a shared **coding standards** document and ESLint and Prettier rules, so reviews are about design.
- Run internal tech talks on topics such as signals, RxJS pitfalls, or the team's architecture decisions.
- Give ownership of small features end to end, including tests and a demo.

---

### Q11. How do you handle disagreement with a product manager or backend team about an API design? `Leadership`

> **Like I'm 5:** Compare the options with their pros and cons, decide together, and write the decision down so people remember why.

**Answer:** I focus on the user problem and the trade-off, not on who is right. I write down two or three options with pros and cons, and I estimate the cost of each. For example, "one endpoint that returns everything is simpler for the UI, but slower and harder to cache; three endpoints are more work, but each one is cacheable and faster." I agree on the decision with the group, record it as an Architecture Decision Record (ADR), and commit to revisiting it with data after release.

---

### Q12. How do you ensure quality and consistency across a team? `Leadership`

> **Like I'm 5:** Use shared rules, a shared kit of parts, tests, and a regular meeting to improve how the team works.

**Answer:**
- Definition of Done that includes tests, accessibility checks, and performance budget checks.
- Architecture Decision Records for important choices.
- Shared libraries and a design system so teams do not reinvent components.
- Monitoring and error budgets for production health.
- A regular retrospective to fix process problems, not only code problems.

---

### Q13. What would you do in your first 30 days on a new Angular + Java project? `Leadership`

> **Like I'm 5:** Learn the setup first, meet the people, fix a small thing, and then suggest improvements.

**Answer:**
- **Week 1**: set up the local environment, run the app and tests, read the architecture docs, and map the main user flows.
- **Week 2**: talk to the product owner, backend developers, and support team. Learn the top production issues.
- **Week 3**: fix a small bug or add a small feature end to end, to learn the delivery pipeline.
- **Week 4**: propose two or three improvements, such as missing tests, slow screens, or unclear error messages, and prioritize them with the team.

---

### Q14. How do you keep up with Angular's fast release cycle? `Core`

> **Like I'm 5:** Angular releases a big new version about every six months. Update one small step at a time, like climbing stairs.

**Answer:** Angular releases a new major version roughly every six months, with a clear deprecation policy. I follow the official Angular blog and update guide, use `ng update` to migrate step by step, and keep dependencies current with Renovate. I plan migrations as small tasks, not one big rewrite, and I read the release notes before every upgrade.
