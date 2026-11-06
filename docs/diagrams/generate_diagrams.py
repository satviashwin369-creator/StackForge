import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

os.makedirs('docs/diagrams', exist_ok=True)

def create_box(ax, x, y, w, h, title, subtitle="", bg="#111827", border="#3b82f6", title_color="#60a5fa", text_color="#cbd5e1", title_size=11, text_size=9, corner_radius=12):
    # Main box
    box = patches.FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad=0,rounding_size={corner_radius}", facecolor=bg, edgecolor=border, linewidth=1.5)
    ax.add_patch(box)
    
    # Header bar
    header_h = 24
    if h > 50:
        header_box = patches.FancyBboxPatch((x, y + h - header_h), w, header_h, boxstyle=f"round,pad=0,rounding_size={corner_radius}", facecolor=border, edgecolor=border, linewidth=1)
        ax.add_patch(header_box)
        # Rect to fill bottom corners of header
        rect_fill = patches.Rectangle((x, y + h - header_h), w, header_h/2, facecolor=border, edgecolor="none")
        ax.add_patch(rect_fill)
        ax.text(x + 12, y + h - header_h/2 - 2, title, fontsize=title_size, fontweight='bold', color="#ffffff", va='center')
    else:
        ax.text(x + w/2, y + h/2 + (4 if subtitle else 0), title, fontsize=title_size, fontweight='bold', color=title_color, ha='center', va='center')
        
    if subtitle and h > 50:
        lines = subtitle.split('\n')
        curr_y = y + h - header_h - 14
        for line in lines:
            ax.text(x + 12, curr_y, line, fontsize=text_size, color=text_color, va='center')
            curr_y -= 15
    elif subtitle:
        ax.text(x + w/2, y + h/2 - 10, subtitle, fontsize=text_size, color=text_color, ha='center', va='center')

def draw_arrow(ax, x1, y1, x2, y2, color="#60a5fa", label="", label_pos=0.5, label_offset=(0, 10), style="->", lw=1.5, ls="-"):
    arrow = patches.FancyArrowPatch((x1, y1), (x2, y2), arrowstyle=style, color=color, linewidth=lw, linestyle=ls, mutation_scale=14)
    ax.add_patch(arrow)
    if label:
        lx = x1 + (x2 - x1) * label_pos + label_offset[0]
        ly = y1 + (y2 - y1) * label_pos + label_offset[1]
        ax.text(lx, ly, label, fontsize=8.5, color=color, fontweight='bold', ha='center', va='center', bbox=dict(boxstyle='round,pad=0.2', facecolor='#0b0f19', edgecolor='none'))

# ==========================================
# 1. HLD SYSTEM ARCHITECTURE
# ==========================================
fig, ax = plt.subplots(figsize=(14, 10), facecolor='#0a0e17')
ax.set_facecolor('#0a0e17')
ax.set_xlim(0, 1400)
ax.set_ylim(0, 950)
ax.axis('off')

# Header
ax.text(50, 910, "⚡ StackForge — High-Level Design (HLD) Architecture Blueprint", fontsize=18, fontweight='bold', color="#f8fafc")
ax.text(50, 885, "Microservice-Decoupled Event-Driven Cloud Native Platform • 100% Codebase Grounded", fontsize=11, color="#94a3b8")

# Tier 1: Client & Presentation
create_box(ax, 50, 720, 1300, 130, "1. CLIENT & PRESENTATION TIER (Port :3000)", bg="#0f172a", border="#2563eb", title_color="#93c5fd")
create_box(ax, 70, 735, 260, 60, "Developer Browser", "http://localhost:3000\nUI & Live Terminal Viewer", bg="#1e293b", border="#3b82f6")
create_box(ax, 370, 735, 340, 60, "Next.js 16.2.6 App Router", "React 19.2 • Tailwind v4 (OKLCH)\nRoute Groups: (auth) & (dashboard)", bg="#1e293b", border="#3b82f6")
create_box(ax, 750, 735, 260, 60, "Zustand Client Store", "JWT Token Storage\nAutomatic Cookie Hydration", bg="#1e293b", border="#3b82f6")
create_box(ax, 1050, 735, 275, 60, "Live Console Subsystem", "useLiveLogs Hook • Circular Buffer\nSub-10ms Stream Rendering", bg="#1e293b", border="#10b981", title_color="#34d399")

# Connectors Tier 1 -> Tier 2
draw_arrow(ax, 540, 720, 540, 650, color="#60a5fa", label="HTTP REST (Bearer JWT)")
draw_arrow(ax, 1180, 720, 1180, 650, color="#34d399", label="WSS Stream (?token=JWT)")

# Tier 2: API Gateway
create_box(ax, 50, 510, 1300, 140, "2. API & INGRESS GATEWAY TIER — FASTAPI 0.115 (Port :8000)", bg="#0f172a", border="#0284c7")
create_box(ax, 70, 525, 290, 80, "REST Sub-Routers (/api/v1)", "/auth: login, register\n/projects: CRUD microservices\n/deployments: trigger, history\n/infra: fleet metrics", bg="#1e293b", border="#0ea5e9")
create_box(ax, 390, 525, 300, 80, "JWT Security & Validation", "Passlib Bcrypt (Work Factor 12)\npython-jose (HS256 Signing)\nPydantic v2 Payload Validation", bg="#1e293b", border="#0ea5e9")
create_box(ax, 720, 525, 300, 80, "WebSocket Gateway", "Endpoint: /api/v1/ws/logs/{id}\nValidates ?token query parameter\nSubscribes Redis Pub/Sub", bg="#1e293b", border="#10b981", title_color="#34d399")
create_box(ax, 1050, 525, 275, 80, "Prometheus Middleware", "Exposes: /metrics\nCaptures request duration, counts,\nand active deployment gauge", bg="#1e293b", border="#f97316", title_color="#fb923c")

# Connectors Tier 2 -> Lower Tiers
draw_arrow(ax, 215, 510, 215, 430, color="#a78bfa", label="delay() Task Enqueue")
draw_arrow(ax, 540, 510, 540, 430, color="#f59e0b", label="Redis LPUSH & SUBSCRIBE")
draw_arrow(ax, 870, 510, 870, 430, color="#38bdf8", label="SQLAlchemy 2.0 Pool")

# Tier 3: Async Tier & Persistence
create_box(ax, 50, 260, 400, 170, "3. CELERY 5.4 WORKER POOL", "stackforge-worker container\nTask: execute_deployment_task\n6-Stage Pipeline Simulator:\n  CLONE → INSTALL → TEST\n  BUILD → PUSH → DEPLOY\nUpdates DB & publishes log lines", bg="#0f172a", border="#7c3aed")

create_box(ax, 490, 260, 400, 170, "4. REDIS 7 MESSAGE HUB (:6379)", "stackforge-redis container\nMulti-Role In-Memory Architecture:\n• DB 0: WebSocket Pub/Sub Bus\n  Channel: 'deployments:{id}:logs'\n• DB 1: Celery FIFO Task Broker\n• DB 2: Celery Result Backend", bg="#0f172a", border="#dc2626")

create_box(ax, 930, 260, 420, 170, "5. POSTGRESQL 16 PERSISTENCE (:5432)", "stackforge-db container\nACID Relational Storage Engine:\n• users: credentials & bcrypt hashes\n• projects: microservice metadata\n• deployments: pipeline status & SHAs\n• deployment_logs: permanent traces", bg="#0f172a", border="#1d4ed8")

# Horizontal links in Tier 3
draw_arrow(ax, 450, 345, 490, 345, color="#f87171", label="BRPOP & PUBLISH")
draw_arrow(ax, 890, 345, 930, 345, color="#60a5fa", label="Batch Log Persist")

# Tier 4: Observability Tier
create_box(ax, 50, 50, 1300, 160, "6. FULL-STACK OBSERVABILITY & MONITORING TIER", bg="#0f172a", border="#d97706")
create_box(ax, 70, 65, 290, 95, "Prometheus v3.5 (:9090)", "Scrapes backend:8000/metrics (15s)\nStores time-series metrics\nTSDB volume: prometheus_data", bg="#1e293b", border="#f59e0b", title_color="#fbbf24")
create_box(ax, 390, 65, 300, 95, "Grafana 12.1.1 (:3001)", "Auto-Provisioned Dashboards\nDatasources: Prometheus & Loki\nDashboard: StackForge Overview", bg="#1e293b", border="#f59e0b", title_color="#fbbf24")
create_box(ax, 720, 65, 300, 95, "Grafana Loki 3.5 (:3100)", "Chunk-based log storage engine\nIndexes labels; LogQL analytics\nVolume: loki_data", bg="#1e293b", border="#f59e0b", title_color="#fbbf24")
create_box(ax, 1050, 65, 275, 95, "Grafana Alloy v1.10", "Dynamic container log discovery\nLabels container stdout/stderr\nShips batches to Loki", bg="#1e293b", border="#f59e0b", title_color="#fbbf24")

# Links to observability
draw_arrow(ax, 1180, 510, 1180, 230, color="#f59e0b", label="Pull Scrape (:8000/metrics)", ls="--")
draw_arrow(ax, 1180, 230, 215, 160, color="#f59e0b", ls="--")

plt.tight_layout()
plt.savefig('docs/diagrams/hld-architecture.png', dpi=180, bbox_inches='tight', facecolor='#0a0e17')
plt.close()
print("Saved docs/diagrams/hld-architecture.png")

# ==========================================
# 2. LLD COMPONENT & CLASS HIERARCHY
# ==========================================
fig, ax = plt.subplots(figsize=(14, 9), facecolor='#0a0e17')
ax.set_facecolor('#0a0e17')
ax.set_xlim(0, 1400)
ax.set_ylim(0, 900)
ax.axis('off')

ax.text(50, 860, "🧩 StackForge — Low-Level Design (LLD) Component & Class Hierarchy", fontsize=18, fontweight='bold', color="#f8fafc")
ax.text(50, 835, "FastAPI Dependency Injection • SQLAlchemy 2.0 ORM • Pydantic v2 Schemas • Celery Pipeline", fontsize=11, color="#94a3b8")

# Col 1: Routers
create_box(ax, 50, 60, 300, 740, "1. API ROUTER LAYER (api/v1/)", bg="#0f172a", border="#0284c7")
create_box(ax, 65, 630, 270, 130, "FastAPIApp (main.py)", "+ lifespan(app: FastAPI)\n+ add_middleware(CORSMiddleware)\n+ add_middleware(PrometheusMiddleware)\n+ include_router(api_v1_router)", bg="#1e293b", border="#0ea5e9")
create_box(ax, 65, 340, 270, 260, "Sub-Routers (app/api/v1/)", "• auth.py:\n  POST /login (OAuth2PasswordRequest)\n  POST /register (UserRegister)\n• projects.py:\n  GET /projects, POST /projects\n  DELETE /projects/{id}\n• deployments.py:\n  POST /{id}/deploy -> 202 Accepted\n  GET /{id}/logs (Historical)\n• ws.py:\n  /ws/logs/{id}?token=<JWT>\n• infra.py:\n  GET /nodes, GET /health", bg="#1e293b", border="#0ea5e9")
create_box(ax, 65, 90, 270, 220, "Dependency Injection", "+ Depends(get_db) -> Session\n+ Depends(get_current_user) -> User\n+ Depends(get_redis) -> RedisClient\n+ Depends(validate_ws_token) -> str\n\nGuarantees context-managed DB sessions\nand automatic session cleanup.", bg="#1e293b", border="#0ea5e9")

# Col 2: Services
create_box(ax, 380, 60, 320, 740, "2. DOMAIN SERVICE LAYER", bg="#0f172a", border="#7e22ce")
create_box(ax, 395, 630, 290, 130, "AuthService (security.py)", "+ verify_password(plain, hash) bool\n+ get_password_hash(password) str\n+ create_access_token(data, exp) str\n+ decode_token(jwt_token) dict", bg="#1e293b", border="#a855f7")
create_box(ax, 395, 470, 290, 130, "DeploymentService", "+ trigger_deployment(proj_id, user_id)\n+ create_deployment_record(db)\n+ dispatch_celery_task(dep_id)\n+ fallback_to_background_tasks()", bg="#1e293b", border="#a855f7")
create_box(ax, 395, 230, 290, 210, "DeploymentSimulator", "deployment_simulator.py\n+ run_pipeline(deployment_id, redis, db)\n- execute_stage(stage, duration)\n- publish_log(channel, text)\n- update_status(status, db)\n- batch_insert_logs(logs, db)\n\nSimulates 6 Canonical Stages:\nCLONE -> INSTALL -> TEST ->\nBUILD -> PUSH -> DEPLOY", bg="#1e293b", border="#a855f7")
create_box(ax, 395, 90, 290, 110, "Celery Task Runner", "celery_app.py\n@celery.task(name='run_deployment')\ndef execute_deployment_task(id):\n    sim = DeploymentSimulator()\n    sim.run_pipeline(id)", bg="#1e293b", border="#a855f7")

# Col 3: ORM Models
create_box(ax, 730, 60, 320, 740, "3. SQLALCHEMY 2.0 ORM MODELS", bg="#0f172a", border="#1d4ed8")
create_box(ax, 745, 620, 290, 140, "User (models/user.py)", "+ id: Mapped[UUID] PK\n+ email: Mapped[str] UK (Indexed)\n+ hashed_password: Mapped[str]\n+ full_name: Mapped[str]\n+ is_active: Mapped[bool]\n+ projects: Mapped[List['Project']]", bg="#1e293b", border="#3b82f6")
create_box(ax, 745, 430, 290, 160, "Project (models/project.py)", "+ id: Mapped[UUID] PK\n+ user_id: Mapped[UUID] FK -> users.id\n+ name: Mapped[str] (max 50)\n+ repo_url: Mapped[str]\n+ branch: Mapped[str] ('main')\n+ framework: Mapped[str]\n+ deployments: Mapped[List['Deployment']]", bg="#1e293b", border="#3b82f6")
create_box(ax, 745, 240, 290, 160, "Deployment (deployment.py)", "+ id: Mapped[UUID] PK\n+ project_id: Mapped[UUID] FK\n+ status: Mapped[str] (Indexed)\n+ commit_sha: Mapped[str]\n+ duration_seconds: Mapped[int]\n+ logs: Mapped[List['DeploymentLog']]", bg="#1e293b", border="#3b82f6")
create_box(ax, 745, 90, 290, 120, "DeploymentLog (log.py)", "+ id: Mapped[UUID] PK\n+ deployment_id: Mapped[UUID] FK\n+ stage: Mapped[str]\n+ level: Mapped[str]\n+ message: Mapped[Text]\n+ timestamp: Mapped[datetime]", bg="#1e293b", border="#3b82f6")

# Col 4: Pydantic Schemas
create_box(ax, 1080, 60, 270, 740, "4. PYDANTIC V2 SCHEMAS", bg="#0f172a", border="#047857")
create_box(ax, 1095, 630, 240, 130, "auth_schemas.py", "• UserLogin (email, password)\n• UserRegister (email, pwd, name)\n• TokenResponse (access_token)\n• TokenPayload (sub: user_id)", bg="#1e293b", border="#10b981", title_color="#34d399")
create_box(ax, 1095, 470, 240, 130, "project_schemas.py", "• ProjectCreate (name, repo_url)\n• ProjectUpdate (branch, desc)\n• ProjectRead (id, user_id, status)\n• ProjectListResponse", bg="#1e293b", border="#10b981", title_color="#34d399")
create_box(ax, 1095, 280, 240, 160, "deployment_schemas.py", "• DeploymentCreate (branch)\n• DeploymentRead (id, status, sha)\n• StageStatusDTO (stage, status)\n• DeploymentLogDTO (line, time)", bg="#1e293b", border="#10b981", title_color="#34d399")
create_box(ax, 1095, 90, 240, 160, "infra_schemas.py", "• NodeMetricDTO (cpu, mem, pods)\n• FleetHealthDTO (nodes, uptime)\n• ClusterKPIResponse (success_rate)", bg="#1e293b", border="#10b981", title_color="#34d399")

# Arrows
draw_arrow(ax, 350, 695, 395, 695, color="#a855f7")
draw_arrow(ax, 350, 535, 395, 535, color="#a855f7")
draw_arrow(ax, 700, 335, 745, 320, color="#3b82f6")
draw_arrow(ax, 700, 145, 745, 150, color="#3b82f6")

plt.tight_layout()
plt.savefig('docs/diagrams/lld-components.png', dpi=180, bbox_inches='tight', facecolor='#0a0e17')
plt.close()
print("Saved docs/diagrams/lld-components.png")

# ==========================================
# 3. DEPLOY PACKET SEQUENCE
# ==========================================
fig, ax = plt.subplots(figsize=(14, 9), facecolor='#0a0e17')
ax.set_facecolor('#0a0e17')
ax.set_xlim(0, 1400)
ax.set_ylim(0, 900)
ax.axis('off')

ax.text(50, 860, "🚀 StackForge — The 'Deploy Packet' Lifecycle Sequence", fontsize=18, fontweight='bold', color="#f8fafc")
ax.text(50, 835, "Sub-50ms Asynchronous API Response • Redis Queue Offload • Sub-10ms WebSocket Log Stream", fontsize=11, color="#94a3b8")

# Lifelines
actors = [
    ("1. Browser", 120, "#3b82f6"),
    ("2. Next.js (:3000)", 320, "#3b82f6"),
    ("3. FastAPI (:8000)", 540, "#0ea5e9"),
    ("4. PostgreSQL (:5432)", 760, "#2563eb"),
    ("5. Redis 7 (:6379)", 980, "#dc2626"),
    ("6. Celery Worker", 1180, "#8b5cf6")
]

for name, x, col in actors:
    create_box(ax, x - 80, 770, 160, 45, name, bg="#1e293b", border=col, title_color=col, title_size=10)
    ax.plot([x, x], [80, 770], color="#334155", linestyle="--", linewidth=1.2)

# Sequence Messages
y = 720
def draw_seq_msg(y_pos, x_from, x_to, text, col="#38bdf8", is_dash=False):
    ls = "--" if is_dash else "-"
    draw_arrow(ax, x_from, y_pos, x_to, y_pos, color=col, ls=ls)
    mid_x = (x_from + x_to) / 2
    ax.text(mid_x, y_pos + 12, text, fontsize=9.5, color=col, fontweight='bold', ha='center', va='center', bbox=dict(boxstyle='round,pad=0.2', facecolor='#0b0f19', edgecolor='none'))

draw_seq_msg(710, 120, 320, "1. Click 'Deploy Now' (branch='main')")
draw_seq_msg(660, 320, 540, "2. POST /api/v1/projects/{id}/deploy (Bearer JWT)")
draw_seq_msg(610, 540, 760, "3. INSERT INTO deployments (status='QUEUED')")
draw_seq_msg(560, 540, 980, "4. LPUSH celery execute_task(deployment_id)", col="#f59e0b")
draw_seq_msg(510, 540, 320, "5. HTTP 202 Accepted (< 50ms)", col="#10b981", is_dash=True)
draw_seq_msg(460, 320, 120, "6. Open Live Console Modal", col="#10b981", is_dash=True)

# WS Handshake
draw_seq_msg(410, 120, 540, "7. Connect ws://backend/ws/logs/{id}?token=JWT", col="#10b981")
draw_seq_msg(370, 540, 980, "8. SUBSCRIBE 'deployments:{id}:logs'", col="#f59e0b")

# Celery Loop box
box_loop = patches.FancyBboxPatch((700, 110), 540, 230, boxstyle="round,pad=0,rounding_size=8", facecolor="#1e1b4b", edgecolor="#8b5cf6", linewidth=1.5, linestyle="--")
ax.add_patch(box_loop)
ax.text(715, 320, "PARALLEL ASYNCHRONOUS EXECUTION & LOG STREAMING", fontsize=10, fontweight='bold', color="#c084fc")

draw_seq_msg(280, 980, 1180, "9. BRPOP celery (Claims task)", col="#a78bfa")
draw_seq_msg(230, 1180, 760, "10. UPDATE status='BUILDING'", col="#60a5fa")

ax.text(970, 185, "11. 6 Stages: CLONE -> INSTALL -> TEST -> BUILD -> PUSH -> DEPLOY\nWorker PUBLISH 'deployments:{id}:logs' '[STAGE] ...'\nFastAPI streams WebSocket frame to Browser (< 10ms)", fontsize=9.5, color="#cbd5e1", ha='center', va='center', bbox=dict(boxstyle='round,pad=0.3', facecolor='#0f172a', edgecolor='#10b981'))

draw_seq_msg(130, 1180, 760, "12. UPDATE status='SUCCESS', batch insert logs", col="#10b981")

plt.tight_layout()
plt.savefig('docs/diagrams/deploy-sequence.png', dpi=180, bbox_inches='tight', facecolor='#0a0e17')
plt.close()
print("Saved docs/diagrams/deploy-sequence.png")

# ==========================================
# 4. DOCKER NETWORK TOPOLOGY
# ==========================================
fig, ax = plt.subplots(figsize=(14, 9), facecolor='#0a0e17')
ax.set_facecolor('#0a0e17')
ax.set_xlim(0, 1400)
ax.set_ylim(0, 900)
ax.axis('off')

ax.text(50, 860, "🐳 StackForge — Docker Container Runtime & Network Topology", fontsize=18, fontweight='bold', color="#f8fafc")
ax.text(50, 835, "9 Active Containers • Isolated Bridge Network ('stackforge-network') • Persistent Named Volumes", fontsize=11, color="#94a3b8")

# Host Ports
create_box(ax, 50, 60, 200, 740, "HOST PORTS", bg="#0f172a", border="#475569")
ports = [
    (":3000", "Next.js Web UI", "#3b82f6", 670),
    (":8000", "FastAPI Core & WS", "#0ea5e9", 580),
    (":5432", "PostgreSQL 16 DB", "#2563eb", 490),
    (":6379", "Redis 7 Hub", "#dc2626", 400),
    (":9090", "Prometheus Scraper", "#f59e0b", 310),
    (":3001", "Grafana Dashboards", "#f59e0b", 220),
    (":3100", "Loki Log Engine", "#f59e0b", 130)
]
for p, desc, col, py in ports:
    create_box(ax, 65, py, 170, 65, p, desc, bg="#1e293b", border=col, title_color=col)

# Bridge Network Box
create_box(ax, 280, 60, 800, 740, "DOCKER BRIDGE NETWORK: stackforge-network (Driver: bridge)", bg="#0c1322", border="#1d4ed8")

# Row 1 Containers
create_box(ax, 310, 580, 220, 130, "stackforge-frontend", "Next.js 16.2 Standalone\nInternal Port: :3000\nUSER: nextjs (UID 1001)\nHealthy (HTTP 200)", bg="#111827", border="#3b82f6")
create_box(ax, 570, 580, 220, 130, "stackforge-backend", "FastAPI 0.115 ASGI Core\nInternal Port: :8000\nProbe: /health (200 OK)\nExposes: /metrics", bg="#111827", border="#0ea5e9")
create_box(ax, 830, 580, 220, 130, "stackforge-worker", "Celery 5.4.0 Worker\nNo host port mapped\nConsumes 'celery' queue\nExecutes pipelines", bg="#111827", border="#8b5cf6")

# Row 2 Containers
create_box(ax, 440, 390, 220, 130, "stackforge-db", "PostgreSQL 16 Alpine\nInternal Port: :5432\nProbe: pg_isready\nACID Relational Storage", bg="#111827", border="#2563eb")
create_box(ax, 700, 390, 220, 130, "stackforge-redis", "Redis 7 Alpine\nInternal Port: :6379\nProbe: redis-cli ping\nDB 0 PubSub, DB 1 Queue", bg="#111827", border="#dc2626")

# Row 3 Containers
create_box(ax, 310, 180, 170, 130, "stackforge-prometheus", "Prometheus v3.5\nPort: :9090\nScrapes :8000/metrics\n15s scrape interval", bg="#111827", border="#f59e0b")
create_box(ax, 500, 180, 170, 130, "stackforge-grafana", "Grafana 12.1.1\nPort: :3000\nAuto-provisioned\nLogin: admin / admin", bg="#111827", border="#f59e0b")
create_box(ax, 690, 180, 170, 130, "stackforge-loki", "Loki 3.5 Engine\nPort: :3100\nChunk log storage\nLogQL analytics", bg="#111827", border="#f59e0b")
create_box(ax, 880, 180, 170, 130, "stackforge-alloy", "Grafana Alloy v1.10\nPort: :12345 (internal)\nDiscovers container logs\nShips to Loki", bg="#111827", border="#f59e0b")

# Volumes
create_box(ax, 1110, 60, 240, 740, "PERSISTENT VOLUMES", bg="#0f172a", border="#059669")
vols = [
    ("postgres_data", "/var/lib/postgresql/data\nPreserves DB tables & logs", 620),
    ("prometheus_data", "/prometheus\n15-day time-series retention", 450),
    ("grafana_data", "/var/lib/grafana\nDashboards & admin reset", 280),
    ("loki_data", "/loki\nIndexed container logs", 110)
]
for vn, vd, vy in vols:
    create_box(ax, 1125, vy, 210, 120, vn, vd, bg="#1e293b", border="#10b981", title_color="#34d399", text_color="#a7f3d0")

# Arrows from Host to Containers
draw_arrow(ax, 235, 700, 310, 645, color="#3b82f6")
draw_arrow(ax, 235, 610, 570, 645, color="#0ea5e9")
draw_arrow(ax, 235, 520, 440, 455, color="#2563eb")
draw_arrow(ax, 235, 430, 700, 455, color="#dc2626")
draw_arrow(ax, 235, 340, 310, 245, color="#f59e0b")
draw_arrow(ax, 235, 250, 500, 245, color="#f59e0b")
draw_arrow(ax, 235, 160, 690, 245, color="#f59e0b")

plt.tight_layout()
plt.savefig('docs/diagrams/docker-network.png', dpi=180, bbox_inches='tight', facecolor='#0a0e17')
plt.close()
print("Saved docs/diagrams/docker-network.png")

# ==========================================
# 5. KUBERNETES CLUSTER ARCHITECTURE
# ==========================================
fig, ax = plt.subplots(figsize=(14, 9), facecolor='#0a0e17')
ax.set_facecolor('#0a0e17')
ax.set_xlim(0, 1400)
ax.set_ylim(0, 900)
ax.axis('off')

ax.text(50, 860, "☸️ StackForge — Kubernetes Production Cluster Architecture", fontsize=18, fontweight='bold', color="#f8fafc")
ax.text(50, 835, "Declarative Manifests ('k8s/') • Hardened SecurityContext • KEDA Queue Autoscaling • PVC Storage", fontsize=11, color="#94a3b8")

# Ingress
create_box(ax, 50, 730, 1300, 80, "INGRESS: stackforge.io (TLS 1.3 Termination • k8s/ingress.yaml)", "Route / -> frontend-service:3000   |   Route /api -> backend-service:8000   |   Route /ws -> backend-service:8000", bg="#1e293b", border="#326ce5", title_color="#60a5fa")

# Namespace
create_box(ax, 50, 50, 1300, 650, "NAMESPACE: 'stackforge' (k8s/namespace.yaml)", bg="#0c1322", border="#2563eb")

# Frontend Deployment
create_box(ax, 80, 380, 370, 280, "Frontend Workload", "Service: frontend-service (NodePort 3000)\nDeployment: frontend-deployment (2 Replicas)\n\nPod Specs:\n• runAsNonRoot: true (UID 1001 nextjs)\n• requests: 100m CPU / 128Mi RAM\n• limits: 500m CPU / 512Mi RAM\n• Probes: httpGet / (liveness & readiness)\n• Standalone Next.js 16 container", bg="#111827", border="#3b82f6")

# Backend Deployment
create_box(ax, 490, 380, 390, 280, "Backend API Workload", "Service: backend-service (ClusterIP 8000)\nDeployment: backend-deployment (2 Replicas)\n\nPod Specs:\n• readOnlyRootFilesystem: true\n• capabilities: { drop: ['ALL'] }\n• requests: 200m CPU / 256Mi RAM\n• limits: 1000m CPU / 1Gi RAM\n• Probes: httpGet /health (Port 8000)\n• Injected: stackforge-secret & backend-config", bg="#111827", border="#0ea5e9")

# Worker & KEDA
create_box(ax, 920, 380, 400, 280, "Celery Worker & KEDA Autoscaler", "Deployment: worker-deployment\nKEDA Trigger: Redis 'LLEN celery' > 10\nAutoscales Pods: 1 up to 10 dynamically\n\nPod Specs:\n• O-Fair scheduling flag\n• Concurrency: 4 processes per pod\n• Consumes Redis queue\n• Streams logs over Redis Pub/Sub\n• Dispatches pipeline jobs", bg="#111827", border="#8b5cf6")

# Database StatefulSet
create_box(ax, 80, 80, 370, 260, "PostgreSQL StatefulSet (k8s/database/)", "Service: postgres-service (ClusterIP 5432)\nPod: postgresql-0\n\nPVC: postgres-pvc (5Gi Storage)\n• accessModes: [ReadWriteOnce]\n• storageClassName: standard\n• Mount: /var/lib/postgresql/data\n• runAsUser: 999 (postgres)\nGuarantees ACID relational durability.", bg="#111827", border="#2563eb")

# Redis StatefulSet
create_box(ax, 490, 80, 390, 260, "Redis StatefulSet (k8s/redis/)", "Service: redis-service (ClusterIP 6379)\nPod: redis-master\n\nPVC: redis-pvc (1Gi Storage for AOF snapshots)\n• In-Memory Broker & Pub/Sub Bus\n• Probe: redis-cli ping\n• requests: 100m CPU / 128Mi RAM\nDecouples background jobs from API.", bg="#111827", border="#dc2626")

# Secrets & ConfigMap
create_box(ax, 920, 80, 400, 260, "Config & Secrets Management", "Secret: stackforge-secret (Untracked)\n• POSTGRES_PASSWORD (base64)\n• JWT_SECRET_KEY (HS256 256-bit)\n\nConfigMap: backend-config\n• DATABASE_URL: postgresql://...:5432\n• REDIS_URL: redis://...:6379/0\n• CORS_ORIGINS: http://localhost:3000", bg="#111827", border="#059669")

plt.tight_layout()
plt.savefig('docs/diagrams/k8s-cluster.png', dpi=180, bbox_inches='tight', facecolor='#0a0e17')
plt.close()
print("Saved docs/diagrams/k8s-cluster.png")

# ==========================================
# 6. DATABASE RELATIONAL ERD
# ==========================================
fig, ax = plt.subplots(figsize=(14, 9), facecolor='#0a0e17')
ax.set_facecolor('#0a0e17')
ax.set_xlim(0, 1400)
ax.set_ylim(0, 900)
ax.axis('off')

ax.text(50, 860, "🗄️ StackForge — PostgreSQL 16 Relational Entity-Relationship Diagram (ERD)", fontsize=18, fontweight='bold', color="#f8fafc")
ax.text(50, 835, "SQLAlchemy 2.0 ORM Schema • UUID Primary Keys • Cascade Deletion Integrity • Indexed Foreign Keys", fontsize=11, color="#94a3b8")

# Table 1: users
create_box(ax, 50, 450, 290, 340, "TABLE: users", "🔑 id: UUID (Primary Key)\n📧 email: VARCHAR(255) (UK, INDEX)\n🔒 hashed_password: VARCHAR\n👤 full_name: VARCHAR(100)\n✓ is_active: BOOLEAN (DEFAULT true)\n⏱ created_at: TIMESTAMP WITH TZ\n⏱ updated_at: TIMESTAMP WITH TZ\n\nRelationships:\n• owns 1:N projects\n• cascade delete on removal", bg="#111827", border="#3b82f6")

# Table 2: projects
create_box(ax, 430, 450, 340, 340, "TABLE: projects", "🔑 id: UUID (Primary Key)\n🔗 user_id: UUID (FK -> users.id, INDEX)\n📦 name: VARCHAR(50)\n📝 description: TEXT (NULLABLE)\n🌐 repo_url: VARCHAR(255)\n🌿 branch: VARCHAR(100) (DEFAULT 'main')\n⚙ framework: VARCHAR(50)\n⏱ created_at: TIMESTAMP WITH TZ\n\nCascade:\n• ON DELETE CASCADE from users\n• owns 1:N deployments", bg="#111827", border="#0ea5e9")

# Table 3: deployments
create_box(ax, 870, 450, 380, 340, "TABLE: deployments", "🔑 id: UUID (Primary Key)\n🔗 project_id: UUID (FK -> projects.id, INDEX)\n⚡ status: VARCHAR(20) (INDEX)\n   [QUEUED | BUILDING | SUCCESS | FAILED]\n🔖 commit_sha: VARCHAR(40)\n💬 commit_message: TEXT\n🌿 branch: VARCHAR(100)\n⏱ duration_seconds: INTEGER\n⏱ created_at: TIMESTAMP (Queue time)\n⏱ finished_at: TIMESTAMP (Exit time)\n\nCascade: ON DELETE CASCADE from projects", bg="#111827", border="#8b5cf6")

# Table 4: deployment_logs
create_box(ax, 430, 80, 680, 280, "TABLE: deployment_logs (Historical Build Traces)", "🔑 id: UUID (Primary Key)\n🔗 deployment_id: UUID (FK -> deployments.id, INDEX)\n🚩 stage: VARCHAR(30) [CLONE | INSTALL | TEST | BUILD | PUSH | DEPLOY]\n🏷 level: VARCHAR(10) [INFO | WARN | ERROR | DEBUG]\n📄 message: TEXT (Raw ANSI terminal log line)\n⏱ timestamp: TIMESTAMP WITH TIME ZONE\n\nDesign Rationale:\n• Batch inserted upon stage completion to minimize DB roundtrips.\n• ON DELETE CASCADE from deployments ensures clean deletion.\n• Queried on initial WebSocket connect for seamless historical replay.", bg="#111827", border="#10b981")

# ACID Callout
create_box(ax, 50, 80, 340, 280, "ACID Relational Governance", "• 100% Normalized Relational Schema\n• UUIDv4 eliminates key collision risks\n• Foreign key cascading prevents orphans\n• B-tree indexing on status accelerates\n  dashboard and KPI calculation queries\n• Dual-storage strategy:\n  - Live logs stream via Redis Pub/Sub\n  - Final audit traces persist in PostgreSQL", bg="#0f172a", border="#3b82f6")

# Connectors
draw_arrow(ax, 340, 620, 430, 620, color="#38bdf8", label="1 : N")
draw_arrow(ax, 770, 620, 870, 620, color="#38bdf8", label="1 : N")
draw_arrow(ax, 1060, 450, 1060, 360, color="#38bdf8", label="1 : N")

plt.tight_layout()
plt.savefig('docs/diagrams/database-erd.png', dpi=180, bbox_inches='tight', facecolor='#0a0e17')
plt.close()
print("Saved docs/diagrams/database-erd.png")

# ==========================================
# 7. WEBSOCKET PROTOCOL STATE MACHINE
# ==========================================
fig, ax = plt.subplots(figsize=(14, 9), facecolor='#0a0e17')
ax.set_facecolor('#0a0e17')
ax.set_xlim(0, 1400)
ax.set_ylim(0, 900)
ax.axis('off')

ax.text(50, 860, "📡 StackForge — Real-Time WebSocket Protocol & State Machine", fontsize=18, fontweight='bold', color="#f8fafc")
ax.text(50, 835, "Sub-10ms Streaming Latency • Redis Pub/Sub Bus • Exponential Backoff • HTTP Polling Fallback", fontsize=11, color="#94a3b8")

# Left Column: State Machine
create_box(ax, 50, 50, 680, 750, "PROTOCOL STATE MACHINE LIFECYCLE (useLiveLogs Hook)", bg="#0c1322", border="#10b981")

# State 1
create_box(ax, 80, 680, 260, 80, "1. DISCONNECTED", "Initial component mount\nTerminal console idle state", bg="#1e293b", border="#64748b", title_color="#cbd5e1")
draw_arrow(ax, 210, 680, 210, 620, color="#10b981", label="User Opens Terminal")

# State 2
create_box(ax, 80, 540, 260, 80, "2. AUTHENTICATING", "Connect: ws://backend/ws/logs/{id}\nQuery: ?token=<JWT>", bg="#1e293b", border="#3b82f6", title_color="#60a5fa")

# Branch: Auth Fail
draw_arrow(ax, 340, 580, 440, 580, color="#ef4444", label="Invalid JWT")
create_box(ax, 440, 550, 260, 60, "AUTH_FAILED (Close 1008)", "Policy Violation • Abort connection", bg="#450a0a", border="#ef4444", title_color="#fca5a5")

# State 3
draw_arrow(ax, 210, 540, 210, 480, color="#10b981", label="Token Validated")
create_box(ax, 80, 400, 260, 80, "3. HISTORICAL_SYNC", "Query PostgreSQL deployment_logs\nPush past log array to browser", bg="#1e293b", border="#2563eb", title_color="#60a5fa")

# State 4
draw_arrow(ax, 210, 400, 210, 340, color="#10b981", label="Sync Complete")
create_box(ax, 80, 240, 260, 100, "4. STREAMING_ACTIVE", "Redis SUBSCRIBE\nChannel: 'deployments:{id}:logs'\nWorker pushes build logs\nSub-10ms frame rendering", bg="#1e293b", border="#10b981", title_color="#34d399")

# Branch: Network Drop
draw_arrow(ax, 340, 290, 440, 290, color="#f59e0b", label="Network Drop")
create_box(ax, 440, 250, 260, 80, "5. BACKOFF_RETRY", "Exponential backoff intervals:\n1s -> 2s -> 4s -> 8s (Max 5)\nRe-attaching to WebSocket", bg="#1e293b", border="#f59e0b", title_color="#fbbf24")

# Branch: Fallback
draw_arrow(ax, 570, 250, 570, 180, color="#f59e0b", label="Retries > 5 Failed")
create_box(ax, 440, 80, 260, 100, "6. POLLING_FALLBACK", "Corporate Proxy / WS Blocked\nActivates HTTP polling fallback\nGET /api/v1/logs every 3 seconds\nZero user interruption", bg="#1e293b", border="#3b82f6", title_color="#60a5fa")

# State 5: Terminated
draw_arrow(ax, 210, 240, 210, 160, color="#10b981", label="Stage SUCCESS/FAIL")
create_box(ax, 80, 80, 260, 80, "7. TERMINATED", "Pipeline execution finished\nConnection closes cleanly (1000)\nAuto-scroll unlocked", bg="#1e293b", border="#10b981", title_color="#34d399")

# Right Column: Payload & Terminal Architecture
create_box(ax, 760, 50, 590, 750, "JSON PACKET & TERMINAL BUFFER ARCHITECTURE", bg="#0c1322", border="#38bdf8")

create_box(ax, 790, 470, 530, 290, "WebSocket JSON Payload Structure", "{\n  \"deployment_id\": \"d9a8-uuid-4-sample\",\n  \"stage\": \"BUILD\",\n  \"level\": \"INFO\",\n  \"message\": \"[STAGE 4/6] Compiling standalone assets...\",\n  \"timestamp\": \"2026-11-06T14:22:01.452Z\",\n  \"is_complete\": false\n}\n\nFastAPI streams these JSON envelopes as raw text frames\nover standard RFC 6455 WebSocket TCP sockets.", bg="#111827", border="#0ea5e9", title_color="#38bdf8")

create_box(ax, 790, 80, 530, 360, "LiveConsole Terminal Subsystem Features", "• Circular Memory Buffer (Fixed 1,000 Lines):\n  Prevents browser memory exhaustion and layout thrashing\n  during massive compiler outputs.\n\n• Smart Auto-Scroll with Pause Lock:\n  Automatically sticks to bottom during active streams.\n  If the engineer scrolls up to inspect an error, auto-scroll\n  suspends instantly and reveals a 'Resume Auto-Scroll' pill.\n\n• ANSI & Severity Color Palette:\n  [SUCCESS] -> Emerald Green (#10b981)\n  [INFO]    -> Electric Blue (#3b82f6)\n  [WARN]    -> Amber Yellow (#f59e0b)\n  [ERROR]   -> Crimson Red (#ef4444)\n\n• One-Click Action Controls:\n  Copy All Logs to clipboard & Download raw log file.", bg="#111827", border="#10b981", title_color="#34d399")

plt.tight_layout()
plt.savefig('docs/diagrams/websocket-flow.png', dpi=180, bbox_inches='tight', facecolor='#0a0e17')
plt.close()
print("Saved docs/diagrams/websocket-flow.png")

# ==========================================
# 8. OBSERVABILITY PIPELINE
# ==========================================
fig, ax = plt.subplots(figsize=(14, 9), facecolor='#0a0e17')
ax.set_facecolor('#0a0e17')
ax.set_xlim(0, 1400)
ax.set_ylim(0, 900)
ax.axis('off')

ax.text(50, 860, "📊 StackForge — Full-Stack Observability & Telemetry Pipeline", fontsize=18, fontweight='bold', color="#f8fafc")
ax.text(50, 835, "Prometheus 15s Pull Scrapes • Grafana 12 Auto-Provisioning • Loki Log Aggregation • Alloy Forwarder", fontsize=11, color="#94a3b8")

# Col 1: Sources
create_box(ax, 50, 60, 360, 740, "1. TELEMETRY SOURCES", bg="#0f172a", border="#f59e0b")
create_box(ax, 70, 480, 320, 290, "FastAPI Application (:8000)", "Prometheus Middleware captures:\n\n• http_requests_total\n  Counter with method, handler, status labels\n\n• http_request_duration_seconds\n  Histogram tracking p50, p90, p99 latencies\n\n• stackforge_deployments_total\n  Counter tracking SUCCESS vs FAILED builds\n\n• active_deployments_gauge\n  Gauge tracking concurrent Celery jobs\n\nExposed at: http://backend:8000/metrics", bg="#111827", border="#f59e0b", title_color="#fbbf24")

create_box(ax, 70, 90, 320, 360, "Docker Daemon Standard Output", "Container Log Streams:\n• stackforge-frontend\n• stackforge-backend\n• stackforge-worker\n• stackforge-db\n• stackforge-redis\n\nHost Path:\n/var/lib/docker/containers/*/*.log\nCaptured without mounting /var/run/docker.sock\nunder the logging profile.", bg="#111827", border="#2563eb", title_color="#60a5fa")

# Col 2: Storage
create_box(ax, 450, 60, 420, 740, "2. INGESTION & STORAGE ENGINES", bg="#0f172a", border="#0284c7")
create_box(ax, 470, 480, 380, 290, "Prometheus v3.5 (:9090)", "15-Second Pull Scraper Loop\nTarget: http://backend:8000/metrics\n\nTSDB Engine:\n• 15-day sample retention\n• In-memory block compaction\n• Volume: prometheus_data (persistent)\n\nPromQL Query Interface:\nServes instant vector and range vector queries\nto Grafana dashboards.", bg="#111827", border="#f59e0b", title_color="#fbbf24")

create_box(ax, 470, 90, 380, 360, "Grafana Loki (:3100) & Alloy", "Alloy Log Collector (:12345):\n• Dynamically discovers container names\n• Formats structured labels\n• Pushes batches over HTTP to Loki\n\nLoki TSDB Log Engine (:3100):\n• Chunk-based compressed storage\n• Indexes metadata labels rather than full text\n• LogQL streaming analytics\n• Volume: loki_data (persistent)", bg="#111827", border="#2563eb", title_color="#60a5fa")

# Col 3: Visualization
create_box(ax, 910, 60, 440, 740, "3. GRAFANA 12 VISUALIZATION (:3001)", bg="#0f172a", border="#047857")
create_box(ax, 930, 520, 400, 250, "Dashboard: StackForge Platform Overview", "Auto-provisioned on boot (zero UI setup):\n\n• API Request Rate: 42.8 rps (live gauge)\n• P95 Latency: 34.2 ms (PromQL histogram)\n• Deployment Success Rate: 94.2%\n• Memory & CPU Resource Curves\n\nDatasource: Prometheus (default proxy)", bg="#111827", border="#10b981", title_color="#34d399")

create_box(ax, 930, 110, 400, 380, "Dashboard: Live Container Logs", "Real-Time Centralized Log Inspection:\n\n• Filter query: {service='stackforge-backend'}\n• Level filter: |= 'ERROR'\n• Full historical search across all 9 containers\n\nPre-configured Admin Access:\n• URL: http://localhost:3001\n• User: admin / Password: admin", bg="#111827", border="#10b981", title_color="#34d399")

draw_arrow(ax, 390, 625, 470, 625, color="#f59e0b", label="15s Pull Scrape")
draw_arrow(ax, 390, 270, 470, 270, color="#2563eb", label="Ship Log Batches")
draw_arrow(ax, 850, 625, 930, 625, color="#10b981", label="PromQL")
draw_arrow(ax, 850, 270, 930, 270, color="#10b981", label="LogQL")

plt.tight_layout()
plt.savefig('docs/diagrams/observability.png', dpi=180, bbox_inches='tight', facecolor='#0a0e17')
plt.close()
print("Saved docs/diagrams/observability.png")

# ==========================================
# 9. CI/CD RELEASE PIPELINE
# ==========================================
fig, ax = plt.subplots(figsize=(14, 9), facecolor='#0a0e17')
ax.set_facecolor('#0a0e17')
ax.set_xlim(0, 1400)
ax.set_ylim(0, 900)
ax.axis('off')

ax.text(50, 860, "🔄 StackForge — Automated CI/CD & Artifact Release Pipeline", fontsize=18, fontweight='bold', color="#f8fafc")
ax.text(50, 835, "GitHub Actions Matrix (.github/workflows/ci.yml) • In-Memory SQLite Isolation • Multi-Stage GHCR Publish", fontsize=11, color="#94a3b8")

# Col 1: Trigger
create_box(ax, 50, 450, 260, 350, "1. VCS TRIGGER", bg="#0f172a", border="#64748b")
create_box(ax, 70, 480, 220, 290, "GitHub Repository", "Repo:\nsatviashwin369-creator/stackforge\n\nTriggers:\n• push: [main]\n• pull_request: [main]\n\nRelease PR #1 Merged:\nCommit: 0f048ea\nAuthor: Ashwin Satvi\nPipeline Run #42196587155 (SUCCESS)", bg="#111827", border="#475569")

# Col 2: Matrix
create_box(ax, 350, 450, 500, 350, "2. GITHUB ACTIONS PARALLEL MATRIX", bg="#0f172a", border="#2088ff")

create_box(ax, 370, 630, 460, 140, "Job 1: Frontend CI (Node 20 Runner)", "1. npm run lint         -> ✓ 0 Errors / 0 Warnings\n2. npx tsc --noEmit     -> ✓ Strict TypeScript Pass\n3. npm run build        -> ✓ Next.js Standalone Build", bg="#111827", border="#3b82f6", title_color="#60a5fa")

create_box(ax, 370, 470, 460, 140, "Job 2: Backend CI (Python 3.12 Runner)", "1. conftest.py engine patch -> In-memory SQLite StaticPool\n2. sys.modules mock         -> Redis mock at module import\n3. pytest tests/ -v         -> ✓ 100% Hermetic Pass (< 5s)", bg="#111827", border="#0ea5e9", title_color="#38bdf8")

# Col 3: Docker
create_box(ax, 890, 450, 460, 350, "3. MULTI-STAGE DOCKER & GHCR PUBLISH", bg="#0f172a", border="#047857")
create_box(ax, 910, 480, 420, 290, "Job 3: Docker Build & Release", "• stackforge-backend:\n  Multi-stage slim Python image\n  ghcr.io/satviashwin369-creator/stackforge-backend\n\n• stackforge-frontend:\n  Node 20 standalone image (~150MB)\n  ghcr.io/satviashwin369-creator/stackforge-frontend\n\nTags: :latest & :${{ github.sha }}\nRelease Gate: Publishing strictly restricted to 'main'", bg="#111827", border="#10b981", title_color="#34d399")

# Bottom: Deployment
create_box(ax, 50, 80, 1300, 320, "4. CONTINUOUS DEPLOYMENT ROLLOUT TARGETS", bg="#0c1322", border="#8b5cf6")

create_box(ax, 80, 110, 580, 250, "Local Docker Compose Rollout", "Command:\ndocker compose pull && docker compose up -d\n\nBenefits:\n• Instantly deploys published GHCR images locally\n• Zero compilation overhead on host machine\n• Preserves all PostgreSQL and Grafana named volumes\n• Mirrors Kubernetes 9-container topology 1:1", bg="#111827", border="#8b5cf6", title_color="#c084fc")

create_box(ax, 710, 110, 610, 250, "Kubernetes GitOps Cluster Rollout", "Command / Manifests:\nk8s/ Declarative Workloads & Argo CD GitOps Application\n\nRollout Mechanics:\n• RollingUpdate strategy (maxSurge: 1, maxUnavailable: 0)\n• Replaces old pods without dropping user traffic\n• Liveness & readiness probes verify zero downtime\n• Non-root security contexts enforced", bg="#111827", border="#8b5cf6", title_color="#c084fc")

draw_arrow(ax, 310, 625, 350, 625, color="#2088ff")
draw_arrow(ax, 850, 625, 890, 625, color="#10b981")
draw_arrow(ax, 1120, 450, 1120, 400, color="#8b5cf6")

plt.tight_layout()
plt.savefig('docs/diagrams/cicd-pipeline.png', dpi=180, bbox_inches='tight', facecolor='#0a0e17')
plt.close()
print("Saved docs/diagrams/cicd-pipeline.png")
