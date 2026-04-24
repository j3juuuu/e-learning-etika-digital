'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser } from '../lib/auth';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    resetMessages();

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Nama wajib diisi.');
        return;
      }

      if (password.length < 6) {
        setError('Password minimal 6 karakter.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Konfirmasi password tidak cocok.');
        return;
      }

      const result = registerUser({ name, email, password });
      if (!result.ok) {
        setError(result.message);
        return;
      }

      setSuccess('Pendaftaran berhasil. Anda akan masuk ke aplikasi.');
      router.push('/dashboard');
      return;
    }

    const result = loginUser(email, password);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.push('/dashboard');
  };

  const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    resetMessages();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_24px_80px_rgba(171,49,116,0.16)] backdrop-blur">
        <div>
          <div className="mx-auto flex w-fit rounded-full border border-pink-100 bg-pink-50 p-1 text-sm font-medium text-pink-800">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`rounded-full px-4 py-2 transition ${
                mode === 'login' ? 'bg-pink-600 text-white shadow-sm' : 'hover:bg-pink-100'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`rounded-full px-4 py-2 transition ${
                mode === 'register' ? 'bg-pink-600 text-white shadow-sm' : 'hover:bg-pink-100'
              }`}
            >
              Daftar
            </button>
          </div>

          <h2 className="mt-6 text-center text-3xl font-extrabold text-pink-900">
            {mode === 'login' ? 'Masuk ke Akun Anda' : 'Buat Akun Baru'}
          </h2>
          <p className="mt-2 text-center text-sm text-pink-700">
            {mode === 'login'
              ? 'Masuk dengan akun yang sudah Anda daftarkan'
              : 'Daftar untuk mulai belajar di platform etika digital'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-pink-900">
                  Nama lengkap
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={mode === 'register'}
                  className="block w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-500 focus:outline-none"
                  placeholder="Masukkan nama Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-pink-900">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-500 focus:outline-none"
                placeholder="Alamat email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-pink-900">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-500 focus:outline-none"
                placeholder={mode === 'register' ? 'Minimal 6 karakter' : 'Masukkan password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {mode === 'register' && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-pink-900"
                >
                  Konfirmasi password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required={mode === 'register'}
                  className="block w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-500 focus:outline-none"
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700">
              {success}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-2xl border border-transparent bg-pink-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              {mode === 'login' ? 'Masuk' : 'Daftar'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-pink-700">
              {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="font-medium text-pink-600 hover:text-pink-500"
              >
                {mode === 'login' ? 'Daftar di sini' : 'Masuk di sini'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
