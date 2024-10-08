# SocioBeing_bot (TELEGRAM BOT)

## Description

This bot is integrated with Google GEMINI AI assistant for generating the required content on the go. It considers all the events passed by the user in 24 hours and generates a combined captioning content for social media. It only considers the events between 00:00 and 23:59 and doesn't consider the previous day's events.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [License](#license)
- [Credits](#credits)

## Installation

To install and set up the SocioBeing_bot, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/MayankVerma1702/SocioBeing-bot.git
   cd SocioBeing_bot
   ```

2. **Install Node.js**:
   Download and install Node.js from the [official website](https://nodejs.org/). Verify the installation by running:

   ```bash
   node -v
   npm -v
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Set up environment variables**:
   Create a `.env` file in the root directory and add your Telegram bot token and Google GEMINI API key:

   ```env
   BOT_TOKEN=your_telegram_bot_token
   GEMINI_KEY=your_gemini_api_key
   AI_MODEL=your AI model
   MONGO_CONNECT_STRING=you database connection string
   ```

5. **Run the bot**:
   ```bash
   node server.js
   ```

## Usage

To use the SocioBeing_bot, follow these steps:

1. **Start the bot**:
   Open Telegram and search for your bot by its username. Start a conversation by clicking the "Start" button or sending the `/start` command.

2. **Send events**:
   Send events to the bot in the format it expects. The bot will log these events and generate a combined captioning content for social media based on the events received within the 24-hour window.

3. **Receive captioning content**:
   At the end of the day, the bot will send you a combined captioning content for your social media posts.

## Features

- **Event Logging**: Logs events sent by the user within a 24-hour window.
- **Content Generation**: Uses Google GEMINI AI to generate combined captioning content for social media.
- **Time-bound Processing**: Only considers events between 00:00 and 23:59 of the current day.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Credits

- **Developer**: Mayank Verma
- **Special Thanks**: Google GEMINI AI team for their support and API access.
