# Expense Splitter

A modern, intuitive web application for splitting expenses among friends and family. Built with React, TypeScript, and Tailwind CSS.

## Features

- **Group Management**: Create and manage expense groups
- **Member Management**: Add and remove group members
- **Expense Tracking**: Record expenses with categories and split them among members
- **Balance Calculation**: Automatically calculate who owes what
- **Settlement Suggestions**: Get optimal settlement recommendations to minimize transactions
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd expense-splitter
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Create a Group**: Start by creating a new expense group
2. **Add Members**: Add friends or family members to the group
3. **Record Expenses**: Add expenses and specify who paid and how to split them
4. **View Balances**: See who owes money and who should receive money
5. **Settle Up**: Follow the settlement suggestions to balance all accounts

## Project Structure

```
├── src/
│   └── main.tsx          # Application entry point
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── AddExpense.tsx   # Expense form component
│   ├── Balances.tsx     # Balance display component
│   ├── ExpenseDirectory.tsx # Expense list component
│   ├── Settlements.tsx  # Settlement suggestions component
│   └── Sidebar.tsx      # Navigation sidebar component
├── styles/
│   └── globals.css      # Global styles and Tailwind imports
├── App.tsx              # Main application component
└── index.html           # HTML template
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Deployment

This project is optimized for deployment on Vercel. Simply connect your GitHub repository to Vercel and it will automatically deploy on every push to the main branch.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)