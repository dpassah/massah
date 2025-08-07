import Layout from '../../components/Layout';
import Link from 'next/link';

const cards = [
  {
    title: 'Action Sociale',
    desc: 'Gérer les programmes et projets sociaux.',
    icon: '🤝',
    color: '#1976d2',
    href: '/admin/action-sociale',
    btnLabel: 'Saisir une action',
    bg: '#1976d2',
    colorBtn: '#fff',
  },
  {
    title: 'Section Solidarité',
    desc: 'Gérez directement les données des inondations, du choléra et des aides solidaires depuis cette section.',
    icon: '🌊',
    color: '#388e3c',
    links: [
      { label: 'Saisir un rapport d’inondation', href: '/admin/inondations', bg: '#1976d2', color: '#fff' },
      { label: 'Saisir un rapport de choléra', href: '/admin/cholera', bg: '#388e3c', color: '#fff' },
      { label: 'Saisir une aide solidaire', href: '/admin/aides', bg: '#fbc02d', color: '#143c6d' },
    ],
  },
  {
    title: 'Affaires Humanitaires',
    desc: 'Gérer les interventions et urgences humanitaires.',
    icon: '🚨',
    color: '#e53935',
    href: '/admin/affaires-humanitaires',
    btnLabel: 'Accéder',
    bg: '#e53935',
    colorBtn: '#fff',
  },
  {
    title: 'Actualités',
    desc: 'Publier et gérer les actualités du ministère.',
    icon: '📰',
    color: '#143c6d',
    href: '/actualites',
    btnLabel: 'Accéder',
    bg: '#143c6d',
    colorBtn: '#fff',
  },
];

export default function AdminDashboard() {
  return (
    <Layout>
      <div style={{maxWidth:850,margin:'2.5rem auto',background:'#fff',padding:'2.5rem',borderRadius:'20px',boxShadow:'0 4px 24px rgba(20,60,109,0.11)'}}>
        <h1 style={{fontSize:'1.7rem',color:'#143c6d',marginBottom:'2.2rem',textAlign:'center',letterSpacing:'1px'}}>Tableau de bord administratif</h1>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))',gap:'2.2rem 2.5rem'}}>
          {cards.map(card => (
            <div key={card.title} style={{
              background:'#fafdff',
              borderRadius:14,
              padding:'1.4rem 1.2rem',
              boxShadow:'0 2px 8px #143c6d0a',
              display:'flex',
              flexDirection:'column',
              alignItems:'flex-start',
              transition:'transform 0.2s, box-shadow 0.2s',
              border:`2.5px solid ${card.color}`,
              minHeight:180,
              cursor:'pointer',
              position:'relative',
              overflow:'hidden',
            }}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-6px) scale(1.025)'}
            onMouseLeave={e => e.currentTarget.style.transform='none'}
            >
              <span style={{fontSize:'2.2rem',marginBottom:7,color:card.color}}>{card.icon}</span>
              <h3 style={{margin:'0 0 10px 0',color:'#143c6d',fontWeight:700,fontSize:'1.17rem'}}>{card.title}</h3>
              {card.desc && <p style={{margin:'0 0 14px',color:'#3a4a5d',fontWeight:500}}>{card.desc}</p>}
              {card.links && card.links.length > 0 ? (
                <div style={{display:'flex',flexDirection:'column',gap:'10px',width:'100%'}}>
                  {card.links.map(link => (
                    <Link key={link.href} href={link.href} legacyBehavior>
                      <a style={{background:link.bg,color:link.color,border:'none',borderRadius:8,padding:'7px 18px',fontWeight:600,marginBottom:2,textAlign:'center',fontSize:'1rem',transition:'background 0.2s'}}>{link.label}</a>
                    </Link>
                  ))}
                </div>
              ) : card.href ? (
                <Link href={card.href} legacyBehavior>
                  <a style={{background:card.bg,color:card.colorBtn,border:'none',borderRadius:8,padding:'7px 18px',fontWeight:600,marginTop:8,textAlign:'center',fontSize:'1rem',transition:'background 0.2s'}}>{card.btnLabel}</a>
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}