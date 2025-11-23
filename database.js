const DEV_KEY = "wpDZTII4PQykRIyVXEE-d47y7jeoa6Cg";
const USER_KEY = "03c47281460f4e62ab60e3a497262807";

// VARIABLE STATUS FETCHING (INTEGER)
// 0 = Idle (Bebas), 1 = Busy (Sedang memproses)
let isFetching = 0;

// Helper: Mendapatkan User Key
function getUserKey() {
  return USER_KEY;
}

// Helper: Mendapatkan Waktu Asia/Makassar (GMT+8)
function getMakassarTime() {
  // Menggunakan Intl.DateTimeFormat untuk memaksa timezone
  return new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Makassar",
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-'); // Format jadi: DD-MM-YYYY HH:mm:ss
}

// Helper: Extract Body
async function fetchBodyOnly(res) {
  if (res && res.body) return res.body;
  return res; 
}

// 1. GET PASTE KEY
async function getPasteKey() {
  const payload = new URLSearchParams();
  payload.append("api_option", "list");
  payload.append("api_user_key", getUserKey());
  payload.append("api_dev_key", DEV_KEY);

  try {
    const res = await fetch("https://cors.io/?url=https://pastebin.com/api/api_post.php", {
      method: "POST",
      body: payload
    }).then(response => response.text());

    const keys = [...res.matchAll(/<paste_key>(.*?)<\/paste_key>/g)].map(x => x[1]);
    return keys[0] || "";
  } catch (e) {
    console.error("Error getting key:", e);
    return "";
  }
}

// 2. DELETE PASTE
async function deletePaste(key) {
  if (!key) return;
  
  const payload = new URLSearchParams();
  payload.append("api_option", "delete");
  payload.append("api_user_key", getUserKey());
  payload.append("api_dev_key", DEV_KEY);
  payload.append("api_paste_key", key);

  await fetch("https://cors.io/?url=https://pastebin.com/api/api_post.php", {
    method: "POST",
    body: payload
  });
}

// 3. SAVE DATABASE (CREATE PASTE)
async function saveDatabase(jsonData) {
  const oldKey = await getPasteKey();
  await deletePaste(oldKey);

  const jsonString = JSON.stringify(jsonData);

  const payload = new URLSearchParams();
  payload.append("api_option", "paste");
  payload.append("api_user_key", getUserKey());
  payload.append("api_paste_private", "2"); 
  payload.append("api_paste_name", "ducktype_database");
  payload.append("api_paste_expire_date", "N");
  payload.append("api_paste_format", "json");
  payload.append("api_dev_key", DEV_KEY);
  payload.append("api_paste_code", jsonString);

  await fetch("https://cors.io/?url=https://pastebin.com/api/api_post.php", {
    method: "POST",
    body: payload
  });
  
  return true;
}

// 4. GET DATABASE
async function getDatabase() {
  const key = await getPasteKey();
  if (!key) return []; 

  const payload = new URLSearchParams();
  payload.append("api_option", "show_paste");
  payload.append("api_user_key", getUserKey());
  payload.append("api_dev_key", DEV_KEY);
  payload.append("api_paste_key", key);

  try {
    const res = await fetch("https://cors.io/?url=https://pastebin.com/api/api_raw.php", {
      method: "POST",
      body: payload
    }).then(response => response.json());

    const rawText = await fetchBodyOnly(res);
    return JSON.parse(rawText);
  } catch (e) {
    return [];
  }
}

// ==========================================
// LOGIK UTAMA
// ==========================================

function processRanking(dataArray) {
  // 1. Sortir Score Tertinggi ke Terendah
  dataArray.sort((a, b) => b.score - a.score);

  // 2. Ambil Top 10
  const top10 = dataArray.slice(0, 10);

  // 3. Mapping ulang Rank
  return top10.map((item, index) => ({
    name: item.name,
    score: parseInt(item.score),
    rank: index + 1,
    datetime: item.datetime // Pastikan datetime tetap ada
  }));
}

// FUNGSI UTAMA: SUBMIT SCORE
async function submitScore(name, score) {
  // Cek Flag Integer (0 atau 1)
  if (isFetching === 1) {
    console.warn("System busy (Fetching = 1). Please wait.");
    return false;
  }

  // Set Flag ke 1 (Busy)
  isFetching = 1;
  console.log("Status: Fetching started (1)");

  try {
    let currentData = await getDatabase();

    // Masukkan data baru dengan Datetime Makassar
    currentData.push({
      name: name,
      score: parseInt(score),
      datetime: getMakassarTime(), // Auto add GMT+8 time
      rank: 0 
    });

    // Proses Ranking & Cut Top 10
    const finalData = processRanking(currentData);

    // Simpan
    await saveDatabase(finalData);
    
    console.log("Success save database:", finalData);
    return finalData;

  } catch (error) {
    console.error("Error:", error);
    return false;
  } finally {
    // Kembalikan Flag ke 0 (Idle) apapun yang terjadi
    isFetching = 0;
    console.log("Status: Fetching finished (0)");
  }
}

// FUNGSI CEK RANKING (Tanpa Save)
async function checkRank(score) {
  if (isFetching === 1) return -1; 
  
  const currentData = await getDatabase();
  const simulationData = [...currentData, { score: score }];
  
  simulationData.sort((a, b) => b.score - a.score);
  const myRank = simulationData.findIndex(x => x.score === score) + 1;
  
  return myRank;
}