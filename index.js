import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import User from "./src/models/User.js";
import eventModel from "./src/models/Event.js";
import connectdb from "./src/config/db.js";
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const bot = new Telegraf(process.env.BOT_TOKEN);

const gemini_api_key = process.env.GEMINI_KEY;
const googleAI = new GoogleGenerativeAI(gemini_api_key);

const geminiModel = googleAI.getGenerativeModel({
    model: process.env.AI_MODEL
});

(async () => {
    try {
        await connectdb();
    } catch (error) {
        console.error('Database connection error:', error);
        process.kill(process.pid, 'SIGTERM');
    }
})();

bot.start(async (ctx) => {
    const from = ctx.update.message.from;

    try {
        await User.findOneAndUpdate(
            { tgId: from.id },
            {
                $setOnInsert: {
                    firstName: from.first_name,
                    lastName: from.last_name,
                    isBot: from.is_bot,
                    username: from.username
                }
            },
            { upsert: true, new: true }
        );

        await ctx.reply(
            `Hey ${from.first_name}, Welcome. I will be writing highly engaging social media posts for you 🚀 Just keep doodling me with the events throughout the day. Let's shine on social media ✨`
        );
    } catch (err) {
        console.error('Error in start command:', err);
        await ctx.reply("Facing Difficulties!");
    }
});

bot.command('generate', async (ctx) => {
    const from = ctx.update.message.from;

    const startOfTheDay = new Date();
    startOfTheDay.setHours(0, 0, 0, 0);

    const endOfTheDay = new Date();
    endOfTheDay.setHours(23, 59, 59, 999);

    try {
        const events = await eventModel.find({
            tgId: from.id,
            createdAt: {
                $gte: startOfTheDay,
                $lte: endOfTheDay
            }
        });

        if (events.length === 0) {
            ctx.reply("No event for the day...");
            return;
        }

        console.log("events", events);

        const chatCompletion = await geminiModel.generateContent({
            contents: [
                {
                    role: 'model',
                    parts: [{ text: 'Act as a senior copywriter, you write highly engaging posts for LinkedIn, Facebook, and Twitter using provided thoughts/events throughout the day.' }]
                },
                {
                    role: 'user',
                    parts: [{ text: `Write like a human, for humans. Craft three engaging social media posts tailored for LinkedIn, Facebook, and Twitter audiences. Use simple language. Use given time labels just to understand the order of the event, don't mention the time in the posts. Each post should creatively highlight the following events. Ensure the tone is conversational and impactful. Focus on engaging the respective platform's audience, encouraging interaction, and driving interest in the events: ${events.map(event => event.text).join(', ')}` }]
                }
            ]
        });

        console.log("completions", chatCompletion);
        await ctx.reply("Doing things....");
    } catch (err) {
        console.error('Error in generate command:', err);
        await ctx.reply("Facing difficulties!");
    }
});

bot.on(message('text'), async (ctx) => {
    const from = ctx.update.message.from;
    const messageText = ctx.update.message.text;

    try {
        await eventModel.create({
            text: messageText,
            tgId: from.id
        });
        await ctx.reply('Noted👍, Keep texting me your thoughts. To generate the posts, just enter the command: /generate');
    } catch (err) {
        console.error('Error in message handler:', err);
        await ctx.reply("Facing difficulties, please try again later");
    }
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));