export type StoredUser = {
  name: string;
  email: string;
  password: string;
  createdAt: string;
};

type AuthSuccess = {
  ok: true;
  user: StoredUser;
};

type AuthFailure = {
  ok: false;
  message: string;
};

const USERS_STORAGE_KEY = "users";
const CURRENT_USER_STORAGE_KEY = "currentUser";

function canUseStorage() {
  return typeof window !== "undefined";
}

function readUsers(): StoredUser[] {
  if (!canUseStorage()) {
    return [];
  }

  const rawUsers = localStorage.getItem(USERS_STORAGE_KEY);
  if (!rawUsers) {
    return [];
  }

  try {
    const parsedUsers = JSON.parse(rawUsers);
    return Array.isArray(parsedUsers) ? parsedUsers : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function registerUser(user: {
  name: string;
  email: string;
  password: string;
}): AuthSuccess | AuthFailure {
  const users = readUsers();
  const normalizedEmail = user.email.trim().toLowerCase();

  const existingUser = users.find((storedUser) => storedUser.email === normalizedEmail);
  if (existingUser) {
    return {
      ok: false,
      message: "Email sudah terdaftar. Silakan masuk dengan akun Anda.",
    };
  }

  const nextUser: StoredUser = {
    name: user.name.trim(),
    email: normalizedEmail,
    password: user.password,
    createdAt: new Date().toISOString(),
  };

  writeUsers([...users, nextUser]);
  localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(nextUser));
  localStorage.setItem("isLoggedIn", "true");

  return { ok: true, user: nextUser };
}

export function loginUser(email: string, password: string): AuthSuccess | AuthFailure {
  const users = readUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const matchedUser = users.find(
    (storedUser) =>
      storedUser.email === normalizedEmail && storedUser.password === password
  );

  if (!matchedUser) {
    return {
      ok: false,
      message: "Email atau password salah.",
    };
  }

  localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(matchedUser));
  localStorage.setItem("isLoggedIn", "true");

  return { ok: true, user: matchedUser };
}

export function getCurrentUser(): StoredUser | null {
  if (!canUseStorage()) {
    return null;
  }

  const rawCurrentUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
  if (!rawCurrentUser) {
    return null;
  }

  try {
    return JSON.parse(rawCurrentUser) as StoredUser;
  } catch {
    return null;
  }
}

export function logoutUser() {
  if (!canUseStorage()) {
    return;
  }

  localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  localStorage.removeItem("isLoggedIn");
}
