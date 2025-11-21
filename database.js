const DEV_KEY = "wpDZTII4PQykRIyVXEE-d47y7jeoa6Cg";
const USER_KEY = "03c47281460f4e62ab60e3a497262807";

export function get_paste_key() {
  return globalThis.__pasteKey || "";
}

export function get_user_key() {
  return USER_KEY;
}

export async function delete_paste() {
  const key = get_paste_key();
  if (!key) return "";
  
  const payload = new URLSearchParams();
  payload.append("api_option", "delete");
  payload.append("api_user_key", get_user_key());
  payload.append("api_dev_key", DEV_KEY);
  payload.append("api_paste_key", key);

  const res = await fetch("https://pastebin.com/api/api_post.php", {
    method: "POST",
    body: payload
  });

  return res.text();
}

export async function create_paste(text) {
  await delete_paste();

  const payload = new URLSearchParams();
  payload.append("api_option", "paste");
  payload.append("api_user_key", get_user_key());
  payload.append("api_paste_private", "2");
  payload.append("api_paste_name", "ducktype_database");
  payload.append("api_paste_expire_date", "N");
  payload.append("api_paste_format", "javascript");
  payload.append("api_dev_key", DEV_KEY);
  payload.append("api_paste_code", text);

  const res = await fetch("https://pastebin.com/api/api_post.php", {
    method: "POST",
    body: payload
  });

  const data = await res.text();
  const key = data.replace("https://pastebin.com/", "");
  globalThis.__pasteKey = key;
  return key;
}

export async function show_paste() {
  const payload = new URLSearchParams();
  payload.append("api_option", "show_paste");
  payload.append("api_user_key", get_user_key());
  payload.append("api_dev_key", DEV_KEY);
  payload.append("api_paste_key", get_paste_key());

  const res = await fetch("https://pastebin.com/api/api_raw.php", {
    method: "POST",
    body: payload
  });

  return res.text();
}

export async function list_paste() {
  const payload = new URLSearchParams();
  payload.append("api_option", "list");
  payload.append("api_user_key", get_user_key());
  payload.append("api_dev_key", DEV_KEY);

  const res = await fetch("https://pastebin.com/api/api_post.php", {
    method: "POST",
    body: payload
  });

  const xml = await res.text();
  return [...xml.matchAll(/<paste_key>(.*?)<\/paste_key>/g)].map(x => x[1]);
}

export async function add_paste(text) {
  const existing = get_paste_key() ? await show_paste() : "";
  return create_paste(text + existing);
}
