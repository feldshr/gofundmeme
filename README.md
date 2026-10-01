# GoFundMeme ($GFM) — Web Interface

An open-source, decentralized web interface for the **GoFundMeme ($GFM)** protocol staking on Solana.

> **100% On-Chain & Client-Side**: This application interacts directly with Solana smart contracts via your browser and connected wallet. There is no centralized backend, database, or custodial server. All transactions and state changes are executed strictly on-chain.

---

## 🚀 Features

- **Zero Configuration**: No `.env` files or API keys required to start. Clone, install, and run immediately.
- **Direct On-Chain Interaction**: Communicates directly with the GoFundMeme Anchor program on Solana Mainnet.
- **Public RPC by Default**: Out of the box, connected to **PublicNode** (`https://solana.publicnode.com`, powered by Allnodes) with full CORS support.
- **Custom RPC Support**: Easily enter your own private RPC endpoint directly in the in-app settings (recommended: [Helius](https://helius.dev/)).
- **Priority Fee Control**: Adjust compute unit priority fees (in SOL) in settings to boost transaction speeds during network congestion.
- **Solana Explorer Selector**: Switch between Solscan, Solana Explorer, and SolanaFM.
- **Non-Custodial & Secure**: Connect your wallet (Phantom, Solflare, Coinbase, Ledger, etc.). Your private keys never leave your browser.
- **Modern UI / UX**: Built with React 19, Mantine 8, and TanStack Router with Dark / Light / Auto themes.

---

## ⛓️ On-Chain Details

| Parameter            | Value                                          |
| :------------------- | :--------------------------------------------- |
| **Network**          | Solana Mainnet                                 |
| **Program ID**       | `GFMioXjhuDWMEBtuaoaDPJFPEnL2yDHCWKoVPhj1MeA7` |
| **$GFM Token Mint**  | `E1jCTXdkMRoawoWoqfbhiNkkLbxcSHPssMo36U84pump` |
| **Treasury Address** | `CNJRjP4dwLwAGUgZ9CoGUDiA82jU1rWK9zGvse2T2saL` |

---

## 🛠️ Quick Start

### 1. Requirements

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- `npm`, `pnpm`, or `yarn`

### 2. Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/feldshr/gofundmeme.git
cd gofundmeme

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The app connects to the default public RPC automatically.

### 3. Production Build

To build the static application for production:

```bash
npm run build
```

The compiled assets will be placed in the `dist` folder. Because this is a static single-page application (SPA), it can be deployed to any static host (Cloudflare Pages, Vercel, Netlify, GitHub Pages, IPFS, or local Nginx/S3).

To preview the build locally:

```bash
npm run preview
```

---

## 🌐 RPC Configuration

You can manage your RPC connection at any time by clicking the **Settings (⚙️)** icon in the header:

1. **Default Public RPC (PublicNode)**:
   - Uses `https://solana.publicnode.com` (operated by Allnodes).
   - Free, no registration, no API key required, with browser CORS support.
2. **Custom RPC (Recommended for best performance)**:
   - Select **Custom** in Settings and paste your private RPC URL.
   - **Recommendation**: For faster transaction confirmation and higher throughput, we recommend getting a free personal RPC endpoint from **[Helius](https://helius.dev/)** (free tier includes up to 5,000,000 monthly credits) or other dedicated providers (e.g. QuickNode, Triton).

---

## ⚙️ In-App Settings

Click the **Settings (⚙️)** icon in the header to configure:

- **RPC Endpoint**: Toggle between PublicNode and your Custom RPC URL.
- **Priority Fee**: Adjust transaction priority fees (in SOL) to boost confirmation speeds.
- **Explorer**: Choose your preferred block explorer for viewing transaction hashes and accounts.
- **Theme**: Toggle between Light, Dark, or System theme.

---

## 🔒 Security & Decentralization

- **No Backend Server**: There are no proprietary backend APIs or databases collecting user metadata or private keys.
- **Anchor Framework**: Protocol interactions are strictly governed by the verified GoFundMeme Solana Anchor IDL.
- **Self-Hostable**: Anyone can fork, clone, and host this repository to access the protocol independently.

---

## 📜 Available Scripts

- `npm run dev` — Starts the local dev server with HMR.
- `npm run build` — Typechecks TypeScript and compiles production bundle to `dist/`.
- `npm run preview` — Serves the production build locally.
- `npm run lint` — Runs ESLint checks.

---

## 📄 License

MIT
