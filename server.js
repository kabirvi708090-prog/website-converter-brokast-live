const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// ১. কনফিগারেশন (এখানে আপনার তথ্য দিন)
const token = '8208452328:AAFxYpFggETj8W1IsSnZw0qgpIMkdquBGh4'; // BotFather এর API Token
const ADMIN_ID = 8864523429; // আপনার Telegram Numeric User ID (ID পেতে Telegram-এ @userinfobot ব্যবহার করুন)

const bot = new TelegramBot(token, { polling: true });
const users = new Set(); // ইউজার আইডি জমা রাখার জন্য (উৎপাদনে DataBase ব্যবহার করা ভালো)

// ২. ব্যবহারকারী /start চাপলে আইডি সেভ হবে
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  users.add(chatId);
  bot.sendMessage(chatId, 'স্বাগতম! আমাদের বটে আপনাকে ধন্যবাদ। Html কোডগুলো লাইভ ডিপ্লাই করতে HTML HOSTING এখানে ক্লিক করুন');
});

// ৩. অ্যাডমিন কতজন ইউজার আছে তা দেখতে পারবে (/stats কম্যান্ড দিয়ে)
bot.onText(/\/stats/, (msg) => {
  if (msg.chat.id !== ADMIN_ID) return;
  bot.sendMessage(ADMIN_ID, `📊 মোট বর্তমান ইউজার সংখ্যা: ${users.size} জন`);
});

// ৪. অ্যাডমিন যেকোনো টেক্সট, ছবি, বা ভিডিও পাঠালে তা সবার কাছে ব্রডকাস্ট হবে
bot.on('message', (msg) => {
  // কেবল অ্যাডমিন এবং ব্রডকাস্ট কম্যান্ড ব্যতীত মেসেজ হলে কাজ করবে
  if (msg.chat.id !== ADMIN_ID || msg.text === '/start' || msg.text === '/stats') return;

  let totalSent = 0;
  users.forEach((userId) => {
    // যেকোনো মেসেজ (টেক্সট/ছবি/ভিডিও) ফরওয়ার্ড বা কপি করে সবার কাছে পাঠানো
    bot.copyMessage(userId, ADMIN_ID, msg.message_id)
      .then(() => totalSent++)
      .catch((err) => console.log(`মেসেজ পাঠানো যায়নি ${userId}-কে`));
  });

  bot.sendMessage(ADMIN_ID, `✅ ব্রডকাস্ট শুরু হয়েছে! মেসেজ পাঠানো হচ্ছে...`);
});

// ৫. Render-এ সচল রাখার জন্য ডামি সার্ভার
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is Running!'));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
