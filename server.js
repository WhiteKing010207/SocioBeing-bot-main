import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import User from "./src/models/User.js";
import eventModel from "./src/models/Event.js"
import connectdb from "./src/config/db.js"
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config'

const bot = new Telegraf(process.env.BOT_TOKEN)

const gemini_api_key = process.env.GEMINI_KEY;
const googleAI = new GoogleGenerativeAI(gemini_api_key);

const model = googleAI.getGenerativeModel({ model: process.env.AI_MODEL });



try {
    await connectdb().then(console.log("Database Connected"))
} catch (error) {
    console.log(error)
    process.kill(process.pid, 'SIGTERM')
}

bot.start(async (ctx) =>{

    const from = ctx.update.message.from
    // console.log("started")

    try {
        await User.findOneAndUpdate( {tgId: from.id}, {
            $setOnInsert: {
                firstName: from.first_name,
                lastName: from.last_name,
                isBot: from.is_bot,
                username: from.username
            }
        },{upsert: true, new: true}) 

        await ctx.reply(
            `Hey ${from.first_name}, Welcome. I will be writing highly engaging social media posts for you 🚀 Just keep doodling me with the events throughout the day. Let's shine on social media ✨`
        );
        } 
     catch (err) {
        console.log(err)

        await ctx.reply("Facing Difficulties!")
    }

});

bot.help((ctx) => {
    ctx.reply("Just send the context of activities you want to post to Social Media and then generate the post 😍")
})

bot.command('generate', async(ctx) => {
    const from = ctx.update.message.from;

    const {message_id: waitingMessageId} = await ctx.reply(
        `Hey! ${from.first_name}, kindly wait for a moment. I am curating posts for you 🚀⌚`
    )

    const {message_id: loadingStickerId} = await ctx.replyWithSticker('CAACAgIAAxkBAAN2Znnfcza3RgTsIf3-SCRZ_zf0Uu0AApAJAAJ5XOIJ-mTGapQeXko1BA')

    const startOfTheDay = new Date()
    startOfTheDay.setHours(0, 0, 0, 0)

    const endOfTheDay = new Date()
    endOfTheDay.setHours(23,59,59,999);

    const events = await eventModel.find({
        tgId: from.id,
        createdAt: {
            $gte:startOfTheDay,
            $lte:endOfTheDay
        }
    })

    if(events.length == 0){
        ctx.reply("No event for the day...")
        return 
    }

   
            
                async function generateSocialMediaPosts() {
                    try {
                        const prompt = "Act as a senior copywriter, you write highly engaging posts for LinkedIn, Facebook, and Twitter using provided thoughts/events throughout the day.";
                        
                        const text = {
                            role: 'user',
                            parts: [{
                                text: `Write like a human, for humans. Craft three engaging social media posts tailored for LinkedIn, Facebook, and Twitter audiences. Use simple language. Use given time labels just to understand the order of the event, don't mention the time in the posts. Each post should creatively highlight the following events. Ensure the tone is conversational and impactful. Focus on engaging the respective platform's audience, encouraging interaction, and driving interest in the events:
                                ${events.map(event => event.text).join(', ')}`
                            }]
                        };
                        
                        const result = await model.generateContent([prompt, text.parts[0].text]);
                        const response = await result.response;
                        // console.log(result);
                        const generatedText = response.text();
                        await User.findOneAndUpdate({
                            tgId: from.id,
                        }, {
                            $inc: {
                                promptTokens: result.response.usageMetadata.promptTokenCount,
                                completionTokens: result.response.usageMetadata.totalTokenCount
                            }
                        }
                    )
                        // console.log(generatedText);
                        await ctx.deleteMessage(waitingMessageId)
                        await ctx.deleteMessage(loadingStickerId)
                        await ctx.reply(generatedText)
                    } catch (error) {
                        console.error("Error generating content:", error);
                        ctx.reply("Facing Difficulties Try Again..")
                    }
                }
                generateSocialMediaPosts();
        

        
})

// bot.on(message('sticker'), (ctx) => {
//     console.log('sticker', ctx.update.message)
// })


bot.on(message('text'), async (ctx) => {
    const from = ctx.update.message.from;
    const message = ctx.update.message.text;

    try {
        await eventModel.create({
            text: message,
            tgId: from.id
        })
        await ctx.reply('Noted👍, Keep texting me your thoughts. To generate the posts, just eneter the command: /generate');
    } catch (err) {
        console.log(err)
        await ctx.reply("Facing difficulties please try again later")
    }


})


bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))