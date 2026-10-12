# 🌐 TrafficLens Frontend — Next.js Telemetry Dashboard

> **Computer Networks Project-Based Learning (PBL)**  
> **Production Deployment:** [https://trafficlens-frontend.vercel.app](https://trafficlens-frontend.vercel.app)

---

## 📖 Overview

TrafficLens Frontend is a modern, responsive network monitoring interface built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS**, and **Recharts**. It visualizes real-time network measurements streamed from the local **FastAPI** backend via a secure HTTPS Cloudflare Tunnel.

### Key Views:
1. **Overview Dashboard:** Live bandwidth graphs, download/upload meters, active sockets, and top network consumers.
2. **Devices & Interfaces:** Hardware adapters (NICs) and ARP-discovered local subnet neighbors with click-to-inspect detail modals.
3. **Services & Protocols:** Active TCP/UDP connections mapped to host processes with bandwidth share percentages.
4. **Traffic Details:** Packet capture logs, protocol breakdown (TCP, UDP, ICMP), and endpoint communication flows.
5. **Traffic History:** Persistent time-series bandwidth logs, packet flows, and device discovery logs with pagination.
6. **Settings:** Configurable sampling intervals and bandwidth spike alert thresholds with live PUT API mutations.
7. **About Project:** PBL documentation and educational networking concepts.

---

## 🚀 Getting Started

### Local Development
```bash
# Install dependencies
pnpm install

# Run local development server
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Connecting to Backend
The frontend connects to the backend via `NEXT_PUBLIC_API_URL`:
- **Local Dev:** `NEXT_PUBLIC_API_URL=http://localhost:8000` (in `.env.local`)
- **Production:** `NEXT_PUBLIC_API_URL=https://<your-subdomain>.trycloudflare.com` (configured in Vercel)

---

## 🧪 Verification Commands

```bash
# Type check with TypeScript compiler
pnpm exec tsc --noEmit

# Production build with Turbopack
pnpm run build
```
