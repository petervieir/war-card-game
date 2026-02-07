# War Card Game

A classic War card game implementation with a modern, mobile-first interface built for the Stacks blockchain ecosystem.

## About the Game

War is a simple yet engaging card game where players compete to win all 52 cards. This implementation features:

### Game Rules

- The deck is divided evenly between the player and CPU opponent (26 cards each)
- Each round, both players flip their top card simultaneously
- The player with the higher card wins both cards and adds them to the bottom of their deck
- **Aces are high** (rank 14), and suits are ignored for comparison
- When cards are equal, a **"war"** occurs:
  - Each player places one card face-down
  - Then flips another card face-up
  - The higher face-up card wins all cards on the table
  - Wars can chain multiple times until resolved
- The game ends when one player has all 52 cards

### Run-out Rules

If a player cannot complete a war (needs both face-down and face-up cards), they immediately lose the game.

## Features

- **Mobile-first design** with vertical board layout optimized for touch devices
- **Visual card stacking** that shows face-down and face-up cards during wars
- **Player vs CPU mode** with instant CPU responses
- **Auto-play mode** with adjustable speed (150ms - 2000ms per step)
- **Game statistics** tracking rounds played and wars started
- **Responsive design** that works on all screen sizes
- **Dark mode support** with automatic theme detection

## Technology Stack

### Front-end
- **Next.js 15** (React 18) with App Router
- **TypeScript** for type safety
- **CSS Modules** for component styling
- **Stacks Connect** for wallet integration

### Blockchain
- **Stacks blockchain** for smart contract deployment
- **Clarity** smart contracts (coming soon)
- Ready for on-chain game state and multiplayer features

## Project Structure

```
WarCardGame/
├── front-end/          # Next.js application
│   ├── src/
│   │   ├── app/        # Next.js app router pages
│   │   ├── components/ # Stacks wallet components
│   │   └── features/
│   │       └── war/    # War game implementation
│   │           ├── engine.ts      # Pure game logic
│   │           ├── useWarGame.ts  # React state management
│   │           ├── WarGame.tsx    # UI components
│   │           └── WarGame.module.css
│   └── public/         # Static assets
└── clarity/            # Clarity smart contracts (coming soon)
    ├── contracts/      # Contract source files
    └── tests/          # Contract tests
```

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/petervieir/war-card-game.git
cd war-card-game
```

2. Install dependencies:
```bash
cd front-end
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## How to Play

1. Click **"New game"** to shuffle and deal the cards
2. Click **"Flip"** to reveal both players' top cards
3. The higher card wins - click **"Collect"** to award the cards
4. When cards tie, a **War** begins:
   - Click **"War: Down"** to place face-down cards
   - Click **"War: Up"** to reveal the war cards
5. Enable **Auto-play** to watch the game play itself at your chosen speed
6. First player to collect all 52 cards wins

## Stacks Blockchain Integration

This project is being developed to integrate with the **Stacks blockchain**, enabling:

- **On-chain game state** for provable fairness
- **NFT card ownership** (future feature)
- **Multiplayer battles** with wagering capabilities
- **Leaderboards** stored on-chain
- **Tournament mode** with smart contract prize pools

### Coming Soon

- Clarity smart contracts for game logic verification
- Wallet-based player authentication
- On-chain match history and statistics
- Token rewards for wins
- PvP (player vs player) mode with blockchain settlement

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Game Engine

The game logic is built with pure functions in `engine.ts`, making it:
- **Deterministic** - same seed produces same game
- **Testable** - easy to unit test game rules
- **Blockchain-ready** - logic can be ported to Clarity smart contracts

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## Roadmap

- [x] Basic War game mechanics
- [x] Mobile-first UI with card stacking
- [x] Auto-play functionality
- [ ] Clarity smart contracts for on-chain games
- [ ] Multiplayer PvP mode
- [ ] Wagering with STX tokens
- [ ] NFT card skins and customization
- [ ] Tournament system
- [ ] Leaderboards and achievements

## Contact

For questions or suggestions, please open an issue on GitHub.

---

Built with ❤️ for the Stacks blockchain community
