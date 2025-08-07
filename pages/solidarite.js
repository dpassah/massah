import Head from 'next/head';
import Layout from '../components/Layout';

const cards = [
  {
    title: 'Données des inondations',
    description: 'Accédez aux statistiques et rapports sur les inondations récentes.',
    link: '/solidarite/inondations',
    color: '#e3f2fd',
  },
  {
    title: 'Données du choléra',
    description: 'Suivi et gestion des cas de choléra dans les différentes régions.',
    link: '/solidarite/cholera',
    color: '#fce4ec',
  },
  {
    title: 'Données des aides',
    description: 'Liste des aides et soutiens apportés aux populations affectées.',
    link: '/solidarite/aides',
    color: '#e8f5e9',
  },
];

export default function Solidarite() {
  return (
    <Layout>
      <Head>
        <title>Solidarité – Ministère du Travail Social, Solidarité et Affaires Humanitaires</title>
      </Head>
      <h1 className="section-title">Solidarité</h1>
      <div style={{display:'flex',gap:'2rem',flexWrap:'wrap',justifyContent:'center',marginTop:'2rem'}}>
        {cards.map((card, idx) => (
          <a
            key={idx}
            href={card.link}
            style={{
              background: card.color,
              padding: '2rem 1.5rem',
              borderRadius: '14px',
              minWidth: '260px',
              maxWidth: '320px',
              boxShadow: '0 2px 8px rgba(20,60,109,0.07)',
              textDecoration: 'none',
              color: '#143c6d',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              transition: 'transform 0.15s',
              fontWeight: 500,
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)'}
            onMouseOut={e => e.currentTarget.style.transform = 'none'}
          >
            <h2 style={{margin:'0 0 0.6rem 0',fontSize:'1.2rem',fontWeight:700}}>{card.title}</h2>
            <p style={{margin:0,color:'#444',fontSize:'1rem'}}>{card.description}</p>
          </a>
        ))}
      </div>
    </Layout>
  );
}