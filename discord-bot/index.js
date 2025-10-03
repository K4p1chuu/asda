const { Client, GatewayIntentBits, PermissionsBitField, Events } = require('discord.js');
const fetch = require('node-fetch');

// --- KONFIGURACJA ---
const BOT_TOKEN = 'MTQxMTI2OTA5NDUyNjY4MTExOQ.GgNKrJ.MV63vRNtGWQYF632x7G-gptR9FVZAG52c0zC5Q';
const API_BASE_URL = 'https://plumbous-olen-oviparous.ngrok-free.dev';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 sekundy

// --- ID KANAŁÓW I RÓL ---
const GUILD_ID = '1202645184735613029'; // <--- ZMIEŃ TO ID!
const ADMIN_ROLE_ID = '1253430966194540564'; // <--- ZMIEŃ TO ID!
const INSPECTION_CHANNEL_ID = '1412119165208363068'; // <--- ZMIEŃ NA ID KANAŁU BADAŃ TECHNICZNYCH!

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, () => {
  console.log(`Zalogowano jako ${client.user.tag}! Bot jest gotowy do pracy.`);
});

async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
    try {
        const response = await fetch(url, options);
        if (response.ok) {
            // Spróbuj sparsować JSON, ale bądź gotów na błąd, jeśli odpowiedź jest pusta
            const text = await response.text();
            if (!text) return { ok: true, json: async () => ({}) }; // Pusta odpowiedź, ale OK
            return { ok: true, json: async () => JSON.parse(text), text: async () => text, status: response.status };
        }
        
        if (retries > 0) {
            console.log(`Nieudane żądanie do ${url} (status: ${response.status}). Ponawiam próbę za ${RETRY_DELAY / 1000}s... (${retries} prób pozostało)`);
            await new Promise(res => setTimeout(res, RETRY_DELAY));
            return fetchWithRetry(url, options, retries - 1);
        }
        return { ok: false, text: async () => await response.text(), status: response.status };
    } catch (error) {
        if (retries > 0) {
            console.log(`Błąd sieciowy przy żądaniu do ${url}. Ponawiam próbę za ${RETRY_DELAY / 1000}s... (${retries} prób pozostało)`);
            await new Promise(res => setTimeout(res, RETRY_DELAY));
            return fetchWithRetry(url, options, retries - 1);
        }
        throw error;
    }
}


// Parser dla wiadomości z badania technicznego
function parseInspection(content) {
    const data = {};
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);

    lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.startsWith('właściciel pojazdu:')) data.owner = line.substring(line.indexOf(':') + 1).trim();
        if (lowerLine.startsWith('rodzaj nadwozia:')) data.bodyType = line.substring(line.indexOf(':') + 1).trim();
        if (lowerLine.startsWith('marka:')) data.make = line.substring(line.indexOf(':') + 1).trim();
        if (lowerLine.startsWith('model:')) data.model = line.substring(line.indexOf(':') + 1).trim();
        if (lowerLine.startsWith('trim:')) data.trim = line.substring(line.indexOf(':') + 1).trim();
        if (lowerLine.startsWith('rok produkcji:')) data.year = line.substring(line.indexOf(':') + 1).trim();
        if (lowerLine.startsWith('numery rejestracyjne, stan:')) {
            const plateAndState = line.substring(line.indexOf(':') + 1).trim().split(',');
            data.plate = plateAndState[0]?.trim();
            data.state = plateAndState[1]?.trim();
        }
        if (lowerLine.startsWith('historia pojazdu:')) data.history = line.substring(line.indexOf(':') + 1).trim();
        if (lowerLine.startsWith('data następnego badania technicznego:')) data.nextInspectionDate = line.split('**')[1]?.trim();
        if (lowerLine.startsWith('wynik badania:')) data.result = line.includes('Pozytywny') ? 'Pozytywny' : 'Negatywny';
        if (lowerLine.startsWith('powód:')) data.reason = line.substring(line.indexOf(':') + 1).trim();
        if (lowerLine.startsWith('numer skp:')) data.station = line.split('**')[1]?.trim();
    });
    
    const ownerIdMatch = data.owner?.match(/<@(\d+)>/);
    data.ownerId = ownerIdMatch ? ownerIdMatch[1] : null;

    if (!data.ownerId || !data.plate || !data.make || !data.model || !data.result) {
        return null;
    }
    return data;
}


// Ta funkcja zastępuje całą istniejącą funkcję handleSyncCommand
async function handleSyncCommand(message) {
    if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
        return message.reply('Nie masz uprawnień do użycia tej komendy.');
    }
    try {
        const initialReply = await message.reply('Rozpoczynam synchronizację członków z MDT...');
        const guild = await client.guilds.fetch(GUILD_ID);
        const members = await guild.members.fetch();

        const allMembersArray = Array.from(members.values());
        const batchSize = 100;
        let totalSyncedCount = 0;

        for (let i = 0; i < allMembersArray.length; i += batchSize) {
            const batch = allMembersArray.slice(i, i + batchSize);
            await initialReply.edit(`Synchronizuję paczkę ${Math.floor(i / batchSize) + 1}/${Math.ceil(allMembersArray.length / batchSize)}... (${i + batch.length}/${allMembersArray.length} członków)`);

            const membersData = batch.map(member => ({
                discordId: member.id,
                name: member.nickname || member.user.username,
                globalName: member.user.globalName || member.user.username,
                joinedTimestamp: member.joinedTimestamp ? Math.floor(member.joinedTimestamp / 1000) : null,
            }));

            const response = await fetchWithRetry(`${API_BASE_URL}/api/sync-citizens`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(membersData)
            });

            if (response.ok) {
                const result = await response.json();
                totalSyncedCount += result.syncedCount;
            } else {
                const errorText = await response.text();
                if (errorText.trim().toLowerCase().startsWith('<!doctype html>')) {
                     throw new Error(`Otrzymano stronę błędu (status: ${response.status}). Sprawdź, czy adres URL w pliku bota (${API_BASE_URL}) jest poprawny i czy tunel ngrok jest aktywny i wskazuje na działający serwer.`);
                }
                const shortError = errorText.substring(0, 1500);
                throw new Error(`Błąd API przy paczce ${i}: ${response.status} - ${shortError}`);
            }
        }

        await initialReply.edit(`Synchronizacja członków zakończona pomyślnie! Zaktualizowano ${totalSyncedCount} obywateli w MDT.`);

    } catch (error) {
        console.error('Błąd podczas synchronizacji członków:', error);
        await message.reply(`Wystąpił krytyczny błąd podczas synchronizacji członków: ${error.message}`);
    }
}

// NOWA KOMENDA: Synchronizacja wszystkich badań technicznych
async function handleSyncInspectionsCommand(message) {
    if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
        return message.reply('Nie masz uprawnień do użycia tej komendy.');
    }
    try {
        await message.reply('Rozpoczynam synchronizację Badań Technicznych... Może to chwilę potrwać.');
        const channel = await client.channels.fetch(INSPECTION_CHANNEL_ID);
        if (!channel) {
            return message.reply('Nie znaleziono kanału badań technicznych. Sprawdź ID w konfiguracji.');
        }

        let allMessages = [];
        let last_id;
        
        while (true) {
            const options = { limit: 100 };
            if (last_id) {
                options.before = last_id;
            }
            const messages = await channel.messages.fetch(options);
            allMessages.push(...messages.values());
            last_id = messages.lastKey();
            if (messages.size != 100) {
                break;
            }
        }

        const totalMessages = allMessages.length;
        let successCount = 0;
        await message.reply(`Znaleziono ${totalMessages} wiadomości do przetworzenia. Rozpoczynam import...`);

        for (const msg of allMessages.reverse()) { // Przetwarzamy od najstarszych
            if (msg.author.bot) continue;
            
            const inspectionData = parseInspection(msg.content);
            if (inspectionData) {
                 const response = await fetchWithRetry(`${API_BASE_URL}/api/vehicle-inspection`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true' // Dodano nagłówek
                    },
                    body: JSON.stringify({ ...inspectionData, rawMessage: msg.content })
                });
                if(response.ok) {
                    successCount++;
                } else {
                    console.log(`[SYNC_INSPECTIONS_FAIL] Błąd API dla wiadomości ${msg.id}: ${await response.text()}`);
                }
            } else {
                console.log(`[SYNC_INSPECTIONS_FAIL] Nie udało się przetworzyć wiadomości: "${msg.content.replace(/\n/g, "\\n")}"`);
            }
        }
        
        await message.reply(`Synchronizacja badań zakończona! Pomyślnie przetworzono i wysłano ${successCount} z ${totalMessages} badań technicznych.`);

    } catch (error) {
        console.error('Błąd podczas synchronizacji badań:', error);
        await message.reply(`Wystąpił krytyczny błąd podczas synchronizacji badań: ${error.message}`);
    }
}

client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;
  
  const command = message.content.toLowerCase();

  if (command === '!sync') {
      await handleSyncCommand(message);
      return;
  }
  
  if (command === '!syncinspections') {
      await handleSyncInspectionsCommand(message);
      return;
  }
  
  if (message.channel.id === INSPECTION_CHANNEL_ID) {
    // Zakładając, że handleMessage istnieje gdzieś indziej lub zostanie dodana
    // await handleMessage(message); 
  }
});

client.login(BOT_TOKEN);

