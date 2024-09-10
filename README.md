# Ethereum Transaction Tracker

## Overview

The Ethereum Transaction Tracker is a web application designed to monitor and display Ethereum transactions. It fetches transaction data from the Ethereum blockchain and the Etherscan API, providing users with up-to-date information on deposits and other transactions.

## Architecture

### Components

1. **Home Page**: Provides a welcome message and two navigation buttons:
   - **Custom Tracker**: A page for viewing transaction details fetched directly from the Ethereum blockchain.
   - **API Tracker**: A page for viewing transactions fetched via the Etherscan API.

2. **API Route**: Fetches Ethereum deposit logs from the blockchain using ethers.js and processes them to provide transaction details.

3. **Custom Tracker Component**: Displays the latest transactions with details like block number, timestamp, amount, gas fee, and transaction hash.

4. **API Tracker Component**: Retrieves and displays transaction data from the Etherscan API, including internal transactions and standard transactions.

## Setup

### Prerequisites

- Node.js (>= 14.x)
- npm or yarn
- An Ethereum node provider URL (e.g., Infura, Alchemy)
- An Etherscan API key

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/ethereum-transaction-tracker.git
   cd ethereum-transaction-tracker
   ```

2. **Install Dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set Up Environment Variables**

   Create a `.env.local` file in the root of your project and add the following variables:

   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddressHere
   ETHERSCAN_API_KEY=YourEtherscanAPIKeyHere
   Contract_ABI=ContractABIHere
   ```

4. **Run the Development Server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Navigate to `http://localhost:3000` to view the application.

## Project Structure

- **pages/index.tsx**: Contains the Home component with navigation buttons.
- **pages/CustomTracker.tsx**: Contains the Custom Tracker component that displays blockchain transactions.
- **pages/EtherScanAPI.tsx**: Contains the API Tracker component that displays transactions fetched from Etherscan.
- **utils/ethers.ts**: Contains the configuration for the ethers.js provider.
- **routes/api/transactions/route.ts**: Handles the API route to fetch transaction logs from the Ethereum blockchain.

## How It Works

1. **Home Page**: The user is greeted with a welcome message and options to navigate to the Custom Tracker or API Tracker.

2. **Custom Tracker**:
   - Fetches and displays the latest deposit logs from the Ethereum blockchain.
   - Logs are fetched with retry logic to handle rate limits and errors.

3. **API Tracker**:
   - Retrieves and displays transaction data from the Etherscan API.
   - Displays the latest transactions sorted by timestamp with pagination every 10 seconds.

## Features

- **Automatic Refresh**: The transaction data refreshes every 10 seconds to display new transactions.
- **Pagination**: Displays the first 10 transactions and supports additional transactions as needed.
- **Responsive Design**: Built with Tailwind CSS for a modern and responsive interface.

## Contribution

Feel free to fork the repository and submit pull requests. For any issues or feature requests, please open an issue on GitHub.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
