require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const LocalSession = require('telegraf-session-local')

const fs = require('fs');

const bot = new Telegraf(process.env.BOT_TOKEN);   //сюда помещается токен, который дал botFather

const localSession = new LocalSession({
    // Database name/path, where sessions will be located (default: 'sessions.json')
    database: 'sessions.json',
    // Name of session property object in Telegraf Context (default: 'session')
    property: 'session',
    // Type of lowdb storage (default: 'storageFileSync')
    storage: LocalSession.storageFileAsync,
    // Format of storage/database (default: JSON.stringify / JSON.parse)
    format: {
        serialize: (obj) => JSON.stringify(obj, null, 2), // null & 2 for pretty-formatted JSON
        deserialize: (str) => JSON.parse(str),
    },
    // We will use `messages` array in our database to store user messages using exported lowdb instance from LocalSession via Telegraf Context
    state: { messages: [] }
})

// Wait for database async initialization finished (storageFileAsync or your own asynchronous storage adapter)
localSession.DB.then(DB => {
    // Database now initialized, so now you can retrieve anything you want from it
    console.log('Current LocalSession DB:', DB.value())
    // console.log(DB.get('sessions').getById('1:1').value())
})

// Telegraf will use `telegraf-session-local` configured above middleware
bot.use(localSession.middleware())


bot.on('text', (ctx, next) => {
    ctx.session.counter = ctx.session.counter || 0
    ctx.session.counter++
    // Writing message to Array `messages` into database which already has sessions Array
    ctx.sessionDB.get('messages').push([ctx.message]).write()
    // `property`+'DB' is a name of ctx property which contains lowdb instance, default = `sessionDB`
    return next()
})


bot.use(Telegraf.log());

bot.command('start', async (ctx) => {
    ctx.replyWithHTML(`Привет, ${ctx.message.from.first_name ? ctx.message.from.first_name : 'незнакомец'}!  👋 \n\nЯ помогу тебе заказать брендовые вещи с Poizon.\n`, Markup.inlineKeyboard([
        [Markup.button.callback('Рассчёт стоимости', 'calculation')],
        [Markup.button.callback('Инструкция', 'instruction'), Markup.button.callback('Что я получу?', 'Poluchish')]
    ]))
});

bot.action('calculation', async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.replyWithHTML('ну вот') // Обработка нажатия на кнопку
});
bot.action('instruction', async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.replyWithHTML('saddas') // Обработка нажатия на кнопку
});
bot.action('Poluchish', async (ctx) => {
    console.log(ctx.session)
    await ctx.answerCbQuery()
    await ctx.replyWithHTML('📚 Ты <b>получишь</b>', Markup.inlineKeyboard([
        [Markup.button.callback('Оплатить 💳', 'pay')]
    ])) // Обработка нажатия на кнопку
});

bot.action('pay', async (ctx) => {
    console.log(ctx.session)
    await ctx.answerCbQuery()
    await ctx.replyWithHTML('Нечего оплачивать')
});
bot.launch();