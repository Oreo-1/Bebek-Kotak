const DEV_KEY = "wpDZTII4PQykRIyVXEE-d47y7jeoa6Cg";
const USER_KEY = "03c47281460f4e62ab60e3a497262807";

async function fetchBodyOnly(jsonRes) {
  return jsonRes.body;
}


function getUserKey() {
  return USER_KEY;
}

async function deletePaste() {
  const key = await getPasteKey();
  if (!key) return "";

  const payload = new URLSearchParams();
  payload.append("api_option", "delete");
  payload.append("api_user_key", getUserKey());
  payload.append("api_dev_key", DEV_KEY);
  payload.append("api_paste_key", key);

  const res = await fetch("https://cors.io/?url=https://pastebin.com/api/api_post.php", {
    method: "POST",
    body: payload
  }).then(response => response.json());

  return fetchBodyOnly(res);
}

async function createPaste(text) {
  await deletePaste();

  const payload = new URLSearchParams();
  payload.append("api_option", "paste");
  payload.append("api_user_key", getUserKey());
  payload.append("api_paste_private", "2");
  payload.append("api_paste_name", "ducktype_database");
  payload.append("api_paste_expire_date", "N");
  payload.append("api_paste_format", "javascript");
  payload.append("api_dev_key", DEV_KEY);
  payload.append("api_paste_code", text);

  const res = await fetch("https://cors.io/?url=https://pastebin.com/api/api_post.php", {
    method: "POST",
    body: payload
  }).then(response => response.json());

  return fetchBodyOnly(res);
}

async function showPaste() {
  const key = await getPasteKey();
  if (!key) return "";

  const payload = new URLSearchParams();
  payload.append("api_option", "show_paste");
  payload.append("api_user_key", getUserKey());
  payload.append("api_dev_key", DEV_KEY);
  payload.append("api_paste_key", key);

  const res = await fetch("https://cors.io/?url=https://pastebin.com/api/api_raw.php", {
    method: "POST",
    body: payload
  }).then(response => response.json());

  return fetchBodyOnly(res);
}

async function getPasteKey() {
  const payload = new URLSearchParams();
  payload.append("api_option", "list");
  payload.append("api_user_key", getUserKey());
  payload.append("api_dev_key", DEV_KEY);

  const res = await fetch("https://cors.io/?url=https://pastebin.com/api/api_post.php", {
    method: "POST",
    body: payload
  }).then(response => response.json());

  const xml = await fetchBodyOnly(res);
  const keys = [...xml.matchAll(/<paste_key>(.*?)<\/paste_key>/g)].map(x => x[1]);
  return keys[0] || "";
}

async function addPaste(text) {
  const existing = (await getPasteKey()) ? await showPaste() : "";
  if(existing != ""){
    return createPaste(text + ";" + existing);
  } else {
    return createPaste(text);
  }
}
