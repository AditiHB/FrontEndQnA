# 9. Full Stack: Angular + Java (Spring Boot)

This section is the most important for an 8-year full stack profile. Interviewers want to see that you own the contract between the frontend and backend, not just the UI.

### Q1. How do you design the API contract between Angular and a Spring Boot backend? `Core`

> **Like I'm 5:** Write the rules of the conversation first, like a menu, so the frontend and backend agree on what to ask and what comes back.

**Answer:**
- Design the API first, using **OpenAPI** (Swagger). Review it with frontend and backend together before coding.
- Use resource-oriented URLs (`/api/v1/orders/{id}`), correct HTTP verbs and status codes, and consistent naming (`camelCase` JSON).
- Generate the TypeScript client from the OpenAPI spec (for example, `openapi-generator` or `ng-openapi-gen`). This keeps models in sync and catches breaking changes at compile time.
- Version the API (`/api/v1`) and avoid breaking changes: add fields, do not rename or remove them.

---

### Q2. How do you handle CORS between Angular and Spring Boot? `Core`

> **Like I'm 5:** CORS is a bouncer who decides which houses can talk to yours. List only the exact houses you trust.

**Answer:** During development, use the Angular dev server **proxy** so the browser sees a single origin.

```json
// proxy.conf.json
{ "/api": { "target": "http://localhost:8080", "secure": false } }
```

```bash
ng serve --proxy-config proxy.conf.json
```

In production, either serve Angular and the API under the same domain (through a reverse proxy such as Nginx or an ingress), or configure CORS explicitly in Spring. Never use `allowedOrigins("*")` together with `allowCredentials(true)`. List the exact origins.

```java
@Bean
CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("https://app.example.com"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", config);
    return source;
}
```

---

### Q3. How do you secure the Angular and Spring Boot integration with JWT or OAuth2? `Core`

> **Like I'm 5:** Spring checks the ID card (the JWT) on every request. Angular adds the card to every letter.

**Answer:**
- Spring Boot acts as an **OAuth2 Resource Server** that validates JWTs (signature, issuer, audience, expiry).
- The Angular app gets the token from the identity provider (Keycloak, Okta, Azure AD, or Spring Authorization Server), using Authorization Code with PKCE.
- An Angular interceptor adds `Authorization: Bearer <token>`.
- Spring Security enforces roles and ownership with `@PreAuthorize` and method security.

```java
@Bean
SecurityFilterChain api(HttpSecurity http) throws Exception {
    return http
        .csrf(csrf -> csrf.disable())            // stateless bearer-token API
        .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
        .authorizeHttpRequests(a -> a
            .requestMatchers("/api/public/**").permitAll()
            .anyRequest().authenticated())
        .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
        .build();
}
```

---

### Q4. How do you standardize error handling between Java and Angular? `Core`

> **Like I'm 5:** Errors should come back in one standard shape, so Angular knows how to read them every time.

**Answer:** Use **RFC 7807 Problem Details**. Spring 6 / Boot 3 supports `ProblemDetail` natively.

```java
@RestControllerAdvice
class GlobalExceptionHandler {
    @ExceptionHandler(OrderNotFoundException.class)
    ProblemDetail notFound(OrderNotFoundException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setTitle("Order not found");
        pd.setProperty("errorCode", "ORDER_404");
        return pd;
    }
}
```

On the Angular side, an error interceptor maps this body to one `ApiError` type. Use `errorCode` for translated messages, and `detail` only for logs. Never show stack traces or SQL errors to the user.

---

### Q5. How do you map validation errors from Spring to Angular form fields? `Advanced`

> **Like I'm 5:** Spring tells Angular which box had the wrong answer, and Angular shows the message right next to that box.

**Answer:** Spring's `@Valid` produces a `400` with field errors. Include a `violations` array in the problem response:

```json
{
  "title": "Validation failed",
  "status": 400,
  "violations": [{ "field": "email", "message": "must be a valid email" }]
}
```

In Angular, loop over `violations` and call `control.setErrors({ server: message })` on the matching `FormControl`. This keeps one source of truth on the server while still showing inline errors. Use the same rules in frontend validators for good UX, but never rely only on the frontend.

---

### Q6. How do you handle pagination between Spring Data and an Angular table? `Core`

> **Like I'm 5:** Ask for "page 2 with 20 items" each time. For huge lists, ask for "the items after this one" instead.

**Answer:** Spring Data's `Pageable` takes `page`, `size`, and `sort` query parameters. Angular Material's `MatPaginator` and `MatSort` can send the same parameters.

**Pitfall:** Serializing Spring's `Page<T>` directly gives a JSON structure that Spring has described as unstable. Use `PagedModel<T>` (Spring Data 3.3+) to return a stable shape:

```json
{ "content": [...], "page": { "size": 20, "number": 0, "totalElements": 540, "totalPages": 27 } }
```

For very large tables, use **keyset (cursor) pagination**. Offset pagination (`OFFSET 100000`) becomes slow in SQL databases.

---

### Q7. How do you handle IDs and numbers between Java and JavaScript? `Advanced`

> **Like I'm 5:** JavaScript rounds very big numbers, so send big IDs as text.

**Answer:** This is a classic full stack bug.
- JavaScript `number` is a 64-bit float that safely stores integers only up to **2^53 - 1** (about 9 quadrillion).
- A Java `Long` ID generated by a Snowflake-style generator can exceed this and get **silently rounded** in JavaScript.
- **Fix:** serialize large IDs as **strings** in the JSON contract, for example with `@JsonSerialize(using = ToStringSerializer.class)`, and type them as `string` in TypeScript.

Also use `BigDecimal` for money on the backend, and serialize it as a string or a decimal with a fixed scale, never a binary `double`.

---

### Q8. How do you handle dates and time zones between Java and Angular? `Advanced`

> **Like I'm 5:** Store time in UTC, like a world clock, and show it in each user's own time zone. A birthday is just a date, not a time.

**Answer:**
- Store and transmit timestamps in **UTC**, using `Instant` (Java) and ISO-8601 strings (`2026-10-10T10:15:30Z`).
- Spring Boot serializes `Instant` as ISO-8601 by default. Keep `spring.jackson.serialization.write-dates-as-timestamps=false`.
- Use Angular's `DatePipe` or `Intl` to format into the user's time zone. Do not format dates on the server for the UI, unless it is for emails or reports.
- For calendar dates with no time (birthdays), use `LocalDate` and send `YYYY-MM-DD`. Do not convert them to timestamps, because they change day depending on the time zone.

---

### Q9. How do you handle file upload and download between Angular and Spring? `Advanced`

> **Like I'm 5:** Upload sends a file in a box. Download sends one back. For very big files, use a special link so the file goes straight to storage.

**Answer:**
- **Upload**: Angular sends `FormData` with `reportProgress`. Spring uses `@RequestPart MultipartFile file`. Configure `spring.servlet.multipart.max-file-size`.
- **Download**: Spring returns `ResponseEntity<Resource>` with `Content-Disposition`. Angular uses `responseType: 'blob'` and creates an object URL to save the file.
- For very large files, use **pre-signed URLs** on S3 or Azure Blob, so the file does not pass through the Java application.
- Validate file type and size on the server, and never trust the file name or the `Content-Type` header from the client alone.

---

### Q10. How do you add real-time updates, for example order status? `Architect`

> **Like I'm 5:** Server-Sent Events are a radio the server talks on. WebSockets are a phone call that goes both ways. Polling is checking the mailbox every few minutes.

**Answer:** Choose the simplest option:
- **Server-Sent Events (SSE)** with `SseEmitter` in Spring: one-way, works over HTTP, and reconnects automatically in the browser. Good for notifications and dashboards.
- **WebSocket** with STOMP (`spring-boot-starter-websocket`): two-way and suitable for chat or collaborative editing. More infrastructure to manage.
- **Polling** with `timer` or `interval`: simplest and reliable when updates are infrequent.

In Angular, wrap the stream in a service that exposes an observable or signal, and use `takeUntilDestroyed` to close the connection. Handle reconnection with backoff, and refresh the data when the connection comes back, because events may have been missed.

---

### Q11. How do you structure a monorepo for Angular and Spring Boot? `Advanced`

> **Like I'm 5:** Keep the frontend and backend in one shared folder, so one change can update both.

**Answer:**
```
my-app/
├── backend/               # Spring Boot (Maven or Gradle)
├── frontend/              # Angular workspace (npm)
├── contracts/openapi.yaml # shared API contract
├── docker-compose.yml
└── .github/workflows/     # separate build jobs with path filters
```

Benefits: one pull request can change the API and the UI together, and the OpenAPI file is the shared contract. CI runs the backend and frontend jobs in parallel, with path filters, and runs contract tests when `openapi.yaml` changes.

---

### Q12. How do you deploy an Angular SPA with a Spring Boot backend? `Advanced`

> **Like I'm 5:** Build the app once, put it on a server, and make sure refreshing a deep page doesn't show "not found".

**Answer:** Two common options:
1. **Single artifact**: build Angular with `ng build`, copy the output to `src/main/resources/static`, and serve it from Spring Boot. Simple, one deployable. Angular's routes need a **fallback** so that refreshing `/orders/12` does not return a 404. Register a view forward for client-side routes in a `WebMvcConfigurer`, and keep `/api/**` and static assets out of it. Test deep links such as `/orders/12` after each deployment.
   ```java
   @Override
   public void addViewControllers(ViewControllerRegistry registry) {
       registry.addViewController("/{path:[^\\.]*}").setViewName("forward:/index.html");
       registry.addViewController("/{path:[^\\.]*}/{sub:[^\\.]*}").setViewName("forward:/index.html");
   }
   ```
   Keep the number of levels explicit and extend it as the routes grow. A catch-all pattern can accidentally capture API paths.
2. **Separate deployables**: Angular on a CDN or Nginx container, API on Kubernetes or a VM, with an ingress that routes `/api` to Spring. Independent scaling and release, and the frontend can be cached aggressively.

Also remember the Angular `<base href>` and `APP_BASE_HREF` if the app is served under a sub-path.

---

### Q13. How do you generate and version the frontend environment for each deployment? `Core`

> **Like I'm 5:** Build once, then change the settings for each place, so the same box works everywhere.

**Answer:** Build once per environment (dev, test, prod) with `fileReplacements`, or build once and load a runtime `config.json`. Build once and deploy the same artifact everywhere is the better practice, because it avoids "it worked in test" surprises. Put the runtime config in a file that Kubernetes mounts as a ConfigMap, so API URLs change without a rebuild.

---

### Q14. How do you handle caching between the browser, Angular, and Spring? `Advanced`

> **Like I'm 5:** Keep things that never change for a long time. Keep the main page for a short time, so new versions show up quickly.

**Answer:**
- Static Angular assets: hashed file names (`main.abc123.js`) with `Cache-Control: max-age=31536000, immutable`.
- `index.html`: `no-cache`, so new deployments are picked up.
- API responses: `ETag` or `Last-Modified` with Spring's `ShallowEtagHeaderFilter` or manual `ResponseEntity.ok().eTag(...)`. Angular's HTTP cache follows these headers, and a `304` avoids downloading the body.
- Service Worker (`@angular/service-worker`) for offline support, with a clear update strategy.

---

### Q15. How do you trace a request from the Angular UI to the Java backend and database? `Architect`

> **Like I'm 5:** Give each request a trace number, so you can follow it from the screen to the database and back.

**Answer:**
- Generate a **correlation ID** (or use the W3C `traceparent` header) in an Angular interceptor and send it with every request.
- In Spring, use Micrometer Tracing with OpenTelemetry. The trace ID is logged in every log line through MDC.
- Show the trace ID in error toasts, so support can search the logs quickly.
- Use browser RUM (for example, Datadog RUM or Application Insights) to link frontend page views and API calls in one trace.

---

### Q16. How do you test the full stack end to end? `Architect`

> **Like I'm 5:** Test the backend with a real database in a box, and test the screens with a robot that clicks like a user.

**Answer:**
- **Backend**: `@SpringBootTest` with **Testcontainers** for a real PostgreSQL, instead of an in-memory H2 database, to avoid behavior differences.
- **Contract tests**: Spring Cloud Contract or Pact, so the frontend's expectations are checked against the backend on every change.
- **Frontend**: Angular unit tests with a mocked `HttpTestingController`.
- **End-to-end**: Playwright running against a Docker Compose environment with real services and seeded test data.

---

### Q17. A production bug: the Angular page shows stale data after the Java API updated it. How do you investigate? `Architect`

> **Like I'm 5:** Find the cause step by step: is it the screen, the network, the server, or an old saved copy?

**Answer:** I work from the outside in:
1. **Confirm the symptom**: is it a frontend cache, a stale signal or store, an HTTP cache response, or a backend read replica lag?
2. **Check the network tab**: did the browser make a new request? Was it a `304` or a `200` with old data?
3. **Check the backend**: is the database read from a replica with replication lag? Is there a second-level Hibernate cache or a Redis cache without invalidation?
4. **Check the frontend state**: is the store updated after the mutation, or only the list? Is an `OnPush` component not receiving the new reference?
5. **Fix the root cause**: invalidate the cache on write, return the updated resource in the `PUT` response, or update the store from the response, and add a test that reproduces the scenario.

---

### Q18. How do you decide between REST, GraphQL, and gRPC for a project? `Architect`

> **Like I'm 5:** REST is the usual menu. GraphQL lets you order exactly the parts you want. gRPC is a fast private phone line between servers.

**Answer:**
- **REST + OpenAPI**: best default for internal and public APIs. Easy to cache, tooling is mature, and works well with Angular's `HttpClient`.
- **GraphQL**: good when many screens need different shapes of the same data and over-fetching is a real problem. It adds complexity in caching, authorization, and N+1 query control on the Java side.
- **gRPC**: best for service-to-service communication with strong contracts and performance needs. Browsers need gRPC-Web and a proxy, so it is rarely the first choice for the Angular UI.
