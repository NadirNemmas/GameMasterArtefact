const sessions = new Map(); // DiscordUserID -> username

function login(discordId, username) {
  sessions.set(discordId, username);
}

function logout(discordId) {
  sessions.delete(discordId);
}

function getSession(discordId) {
  return sessions.get(discordId);
}
function getUsername(discordId) {
  return sessions.get(discordId);
}

module.exports = { login, logout, getSession, getUsername };
