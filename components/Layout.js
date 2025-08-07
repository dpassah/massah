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

  /* ====== 1) استرجاع الحالة من localStorage عند تحميل الصفحة ====== */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true' || localStorage.getItem('msaah_logged_in') === '1';
      setIsLoggedIn(loggedIn);

      const storedRole = localStorage.getItem('userRole') || '';
      setUserRole(storedRole); // <─ ضمان وجود القيمة في الـstate

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

  /* ====== 2) تسجيل الدخول ====== */
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


  /* ====== 3) تسجيل الخروج ====== */
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

  /* ====== 4) طباعة تصحيحية (اختياري) ====== */
  console.log('[DEBUG] Layout userInfo:', userInfo, 'userRole:', userRole, 'isLoggedIn:', isLoggedIn);

  /* ====== 5) الـ JSX ====== */
  return (
    <>
      {!isLoggedIn && (
        <div style={{position:'fixed',top:'24px',right:'32px',zIndex:1000}}>
          <button onClick={()=>setShowLoginModal(true)} style={{background:'#143c6d',color:'#fff',padding:'0.5rem 1.2rem',borderRadius:'20px',boxShadow:'0 2px 8px rgba(20,60,109,0.10)',fontWeight:600,textDecoration:'none',fontSize:'1rem',border:'none',cursor:'pointer'}}>Connexion</button>
        </div>
      )}

      {showLoginModal && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.25)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowLoginModal(false)}>
          <form onClick={e=>e.stopPropagation()} onSubmit={handleLogin} style={{background:'#fff',padding:'2rem',borderRadius:'12px',boxShadow:'0 4px 24px rgba(20,60,109,0.15)',minWidth:'320px',display:'flex',flexDirection:'column',gap:'1rem'}}>
            <h2 style={{margin:0,color:'#143c6d',fontWeight:700,fontSize:'1.2rem'}}>Connexion</h2>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={{padding:'0.5rem',borderRadius:'6px',border:'1px solid #ccc'}} />
            <label htmlFor="password">Mot de passe</label>
            <input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={{padding:'0.5rem',borderRadius:'6px',border:'1px solid #ccc'}} />
            {error && <div style={{color:'red',fontSize:'0.95rem'}}>{error}</div>}
            <button type="submit" style={{background:'#143c6d',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem',fontWeight:600,marginTop:'0.5rem',fontSize:'1rem'}}>Entrer</button>
          </form>
        </div>
      )}

      {isLoggedIn && (
        <div style={{position:'fixed',top:'24px',right:'32px',zIndex:1000,display:'flex',flexDirection:'column',alignItems:'flex-end'}}>
          <button onClick={handleLogout} style={{background:'#f44336',color:'#fff',padding:'0.5rem 1.2rem',borderRadius:'20px',border:'none',boxShadow:'0 2px 8px rgba(20,60,109,0.10)',fontWeight:600,fontSize:'1rem',cursor:'pointer'}}>Déconnexion</button>
          {(userInfo.nom_delegue || userInfo.province) && (
            <div style={{marginTop:'8px',background:'#fff',color:'#143c6d',padding:'7px 18px',borderRadius:'10px',boxShadow:'0 2px 8px rgba(20,60,109,0.09)',fontWeight:600,fontSize:'1rem',textAlign:'right'}}>
              <div>{userInfo.nom_delegue}</div>
              <div style={{fontSize:'0.95em',fontWeight:400}}>{userInfo.province}</div>
            </div>
          )}
        </div>
      )}

      <header className="main-header" style={{background:'#143c6d', color:'#fff', padding:'1.5rem 0 1rem 0', boxShadow:'0 2px 8px rgba(20,60,109,0.07)'}}>
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}>
          <span className="hamburger-icon"></span>
        </button>
        <div className="header-content" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'1.5rem',flexWrap:'wrap'}}>
          <Image src="/logo.png" alt="Logo" width={90} height={90} style={{background:'#fff',borderRadius:'50%',border:'2px solid #143c6d',boxShadow:'0 2px 8px rgba(20,60,109,0.15)'}} />
          <div>
            <Link href="/" style={{textDecoration:'none', color:'#fff'}}>
              <h1 style={{margin:0, fontSize:'1.4rem', fontWeight:700, letterSpacing:'0.5px'}}>Plateforme des Délégués Provinciaux</h1>
            </Link>
            <h2 style={{margin:0, fontSize:'1.1rem', fontWeight:400}}>Ministère de l'Action Sociale, de la Solidarité et des Affaires Humanitaires</h2>
          </div>
        </div>
        <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
          <nav style={{marginTop:'1rem', display:'flex', justifyContent:'center', gap:'2rem'}}>
          <Link href="/action-sociale">Action Sociale</Link>
          <Link href="/solidarite">Solidarité</Link>
          <Link href="/affaires-humanitaires">Affaires Humanitaires</Link>
          
          {isLoggedIn && (
            <>
              {isLoggedIn && (
                <Link href="/admin" style={{fontWeight:700,color:'#f9c846'}}>Espace Admin</Link>
              )}
              {isLoggedIn && userRole !== 'admin' && userInfo.username !== 'MASSAH' && (
                <Link href="/mes-rapports" style={{fontWeight:700,color:'#143c6d',background:'#f9c846',borderRadius:8,padding:'2px 12px',marginLeft:'12px'}}>Mes rapports</Link>
              )}
              
            </>
          )}
          {isLoggedIn && userRole === 'admin' && userInfo.username === 'MASSAH' && (
            <>
              <Link href="/admin/gestion" style={{fontWeight:700,color:'#fff',background:'#143c6d',borderRadius:8,padding:'2px 12px'}}>Gestion des données</Link>
              <Link href="/admin/comptes" style={{fontWeight:700,color:'#fff',background:'#143c6d',borderRadius:8,padding:'2px 12px'}}>Gestion des comptes</Link>
            </>
          )}
        </nav>
      </header>

      <main className="main-content">{children}</main>

      <footer className="footer">
        {new Date().getFullYear()} Ministère de l`Action Social, Solidarité et Affaires Humanitaires
      </footer>
    </>
  );
}
