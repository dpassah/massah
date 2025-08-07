import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';
import RequireAuth from '../../components/RequireAuth';
import { useRouter } from 'next/router';

const ALL_REPORT_TABLES = ['inondations', 'cholera', 'aides', 'affaires_humanitaires', 'action_sociale', 'actualites'];

export default function AdminComptes() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('comptes')
      .select('*');
    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }

  const handleEditClick = (userId) => {
    router.push(`/admin/modifier-compte/${userId}`);
  };

  const handleClearAllReportData = async () => {
    if (window.confirm('Attention : Êtes-vous sûr de vouloir effacer toutes les données de tous les tableaux de rapports ? Cette action est irréversible !')) {
      setLoading(true);
      let success = true;
      for (const tableName of ALL_REPORT_TABLES) {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .neq('id', 0); // Deletes all rows where id is not 0 (i.e., all rows)

        if (error) {
          console.error(`Error clearing data from ${tableName}:`, error);
          alert(`فشل مسح البيانات من جدول ${tableName}.`);
          success = false;
          break;
        }
      }
      setLoading(false);
      if (success) {
        alert('تم مسح جميع بيانات التقارير بنجاح.');
      } else {
        alert('حدث خطأ أثناء مسح بعض بيانات التقارير. يرجى التحقق من وحدة التحكم.');
      }
      fetchUsers(); // Re-fetch users to ensure display is updated if needed
    }
  };

  return (
    <RequireAuth role="admin">
      <Layout>
        <div style={{maxWidth:900,margin:'2rem auto',background:'#fff',padding:'2.5rem',borderRadius:20,boxShadow:'0 4px 24px rgba(20,60,109,0.11)'}}>
          <h1 style={{fontSize:'1.4rem',color:'#143c6d',marginBottom:'1.5rem',textAlign:'center'}}>Gestion des comptes utilisateurs</h1>
          <button
            onClick={handleClearAllReportData}
            style={{
              padding: '10px 20px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginBottom: '1.5rem',
            }}
          >
            Effacer toutes les données de rapport
          </button>
          {loading ? <div>Chargement...</div> : (
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#f6f8fa'}}>
                  <th style={{padding:'8px 4px',border:'1px solid #b3c0d1'}}>Nom d'utilisateur</th>
                  <th style={{padding:'8px 4px',border:'1px solid #b3c0d1'}}>Nom du délégué</th>
                  <th style={{padding:'8px 4px',border:'1px solid #b3c0d1'}}>Province</th>
                  <th style={{padding:'8px 4px',border:'1px solid #b3c0d1'}}>Rôle</th>
                  <th style={{padding:'8px 4px',border:'1px solid #b3c0d1'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{padding:'7px 4px',border:'1px solid #b3c0d1'}}>{u.username}</td>
                    <td style={{padding:'7px 4px',border:'1px solid #b3c0d1'}}>{u.nom_delegue}</td>
                    <td style={{padding:'7px 4px',border:'1px solid #b3c0d1'}}>{u.province}</td>
                    <td style={{padding:'7px 4px',border:'1px solid #b3c0d1'}}>{u.userrole}</td>
                    <td style={{padding:'7px 4px',border:'1px solid #b3c0d1'}}>
                      <button onClick={() => handleEditClick(u.id)}>Modifier</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Layout>
    </RequireAuth>
  );
}