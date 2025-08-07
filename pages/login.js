// Login.js
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1) Connexion via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),   // L'e-mail doit être unique
      password: password.trim(),
    });

    if (authError || !authData.user) {
      console.error("Supabase auth error:", authError); // Afficher l'erreur dans la console
      setError('Identifiants incorrects.');
      return;
    }

    // 2) Récupération des données utilisateur depuis la table 'comptes'
    const { data: compteData, error: dbError } = await supabase
      .from('comptes')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (dbError || !compteData) {
      setError('Compte introuvable.');
      return;
    }

    // 3) Sauvegarde des données de session (facultatif)
    localStorage.setItem('msaah_logged_in', 'true');
    localStorage.setItem('username', compteData.username);
    localStorage.setItem('userRole', compteData.userrole);

    router.push('/');
  };

  return (
    <Layout>
      <Head><title>Connexion – Ministère</title></Head>
      <h1 className="section-title">Connexion</h1>
      <div className="card" style={{maxWidth:'400px',margin:'0 auto'}}>
        <form onSubmit={handleSubmit} className="login-form" style={{display:'flex',flexDirection:'column',gap:'1.2rem',maxWidth:'340px',margin:'2rem auto',background:'#fff',padding:'2rem',borderRadius:'10px',boxShadow:'0 2px 8px rgba(20,60,109,0.07)'}}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div style={{color:'red'}}>{error}</div>}
          <button type="submit" className="btn-primary" style={{marginTop:'2.5rem',alignSelf:'center',width:'70%'}}>Se connecter</button>
        </form>
      </div>
    </Layout>
  );
}