import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Layout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userInfo, setUserInfo] = useState({ username: '', province: '', nom_delegue: '' });
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  /* ====== 1) Récupération de l'état depuis localStorage au chargement de la page ====== */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true' || localStorage.getItem('msaah_logged_in') === '1';
      setIsLoggedIn(loggedIn);

      const storedRole = localStorage.getItem('userRole') || '';
      setUserRole(storedRole); // Assurer la présence de la valeur dans l'état

      const storedUsername = localStorage.getItem('username') || '';
      if (storedUsername && storedUsername !== 'null' && storedUsername !== 'undefined') {
        supabase
          .from('comptes')
          .select('nom_delegue, province')
          .eq('username', storedUsername)
          .single()
          .then(({ data }) => {
            const userInfoData = {
              username: storedUsername,
              province: data?.province || '',
              nom_delegue: data?.nom_delegue || '',
            };
            setUserInfo(userInfoData);
            // Enregistrer dans localStorage pour le rendre disponible globalement
            localStorage.setItem('province', userInfoData.province);
            localStorage.setItem('nom_delegue', userInfoData.nom_delegue);
          });
      }
    }
  }, []);

  /* ====== 2) Connexion ====== */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Step 1: Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password,
    });

    if (authError || !authData.user) {
      console.error("Supabase auth error:", authError);
      setError("Email ou mot de passe incorrect.");
      return;
    }

    // Step 2: Fetch user profile from 'comptes' table
    const { data: compteData, error: dbError } = await supabase
      .from('comptes')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (dbError || !compteData) {
      setError("Compte introuvable ou erreur de synchronisation.");
      await supabase.auth.signOut(); // Sign out if profile doesn't exist
      return;
    }

    // Step 3: Save session data to localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', compteData.username);
    localStorage.setItem('userRole', compteData.userrole || '');
    localStorage.setItem('province', compteData.province || '');
    localStorage.setItem('nom_delegue', compteData.nom_delegue || '');
    if (compteData.userrole === 'admin') {
      localStorage.setItem('msaah_logged_in', '1');
    }

    // Step 4: Update component state
    setIsLoggedIn(true);
    setUserRole(compteData.userrole || '');
    setUserInfo({
      username: compteData.username,
      province: compteData.province || '',
      nom_delegue: compteData.nom_delegue || '',
    });

    // Step 5: Close modal and clean up
    setShowLoginModal(false);
    setEmail('');
    setPassword('');
    setError('');
    router.push('/admin'); // Redirect to admin or dashboard
  };

  /* ====== 3) Déconnexion ====== */
  const handleLogout = async () => {
    // First, sign out from Supabase to invalidate the session
    await supabase.auth.signOut();

    // Then, clear all local storage items
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('msaah_logged_in');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('province');
    localStorage.removeItem('nom_delegue');

    // Finally, reset the state and redirect
    setIsLoggedIn(false);
    setUserRole('');
    setUserInfo({ username: '', province: '', nom_delegue: '' });
    router.push('/');
  };

  /* ====== 4) Débogage (optionnel) ====== */
  console.log('[DEBUG] Layout userInfo:', userInfo, 'userRole:', userRole, 'isLoggedIn:', isLoggedIn);

  /* ====== 5) Le JSX ====== */
  return (
    <>
      {showLoginModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowLoginModal(false)}>
          <form onClick={e => e.stopPropagation()} onSubmit={handleLogin} style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 24px rgba(20,60,109,0.15)', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ margin: 0, color: '#143c6d', fontWeight: 700, fontSize: '1.2rem' }}>Connexion</h2>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            <label htmlFor="password">Mot de passe</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            {error && <div style={{ color: 'red', fontSize: '0.95rem' }}>{error}</div>}
            <button type="submit" style={{ background: '#143c6d', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.7rem', fontWeight: 600, marginTop: '0.5rem', fontSize: '1rem' }}>Entrer</button>
          </form>
        </div>
      )}

      <header className="main-header">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}>
          <span className="hamburger-icon"></span>
        </button>
        <div className="header-left-group">
          <div className="header-content">
            <Image src="/logo.png" alt="Logo" width={90} height={90} className="header-logo" />
            <div className="header-title-container">
              <Link href="/" className="header-link">
                <h1 className="header-title">Accueil</h1>
              </Link>
              <h2 className="header-subtitle">Ministère de l'Action Sociale, de la Solidarité et des Affaires Humanitaires</h2>
            </div>
          </div>
        </div>
        <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
          <nav className="sidebar-nav">
            <Link href="/action-sociale">Action Sociale</Link>
            <Link href="/solidarite">Solidarité</Link>
            <Link href="/affaires-humanitaires">Affaires Humanitaires</Link>
            {isLoggedIn && (
              <>
                <Link href="/admin" className="admin-link">Espace Admin</Link>
                {userRole !== 'admin' && userInfo.username !== 'MASSAH' && (
                  <Link href="/mes-rapports" className="my-reports-link">Mes rapports</Link>
                )}
                {userRole === 'admin' && userInfo.username === 'MASSAH' && (
                  <>
                    <Link href="/admin/gestion" className="admin-gestion-link">Gestion des données</Link>
                    <Link href="/admin/comptes" className="admin-comptes-link">Gestion des comptes</Link>
                  </>
                )}
              </>
            )}
            <div className="mobile-auth-buttons">
              {isLoggedIn ? (
                <button onClick={handleLogout}>Déconnexion</button>
              ) : (
                <button onClick={() => setShowLoginModal(true)}>Connexion</button>
              )}
            </div>
          </nav>
        </div>
        <div className="desktop-auth-buttons">
          {isLoggedIn ? (
            <button onClick={handleLogout}>Déconnexion</button>
          ) : (
            <button onClick={() => setShowLoginModal(true)}>Connexion</button>
          )}
        </div>
      </header>

      <main className="main-content">{children}</main>

      <footer className="footer">
        {new Date().getFullYear()} Ministère de l`Action Social, Solidarité et Affaires Humanitaires
      </footer>
    </>
  );
}