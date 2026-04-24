import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getLettreApi, regenerateLettreApi, updateLettreApi, deleteLettreApi } from '../api/lettreApi'

const STATUTS = {
  BROUILLON: '📝 Brouillon',
  FINALE: '✅ Finale',
  ENVOYEE: '📤 Envoyée',
  ARCHIVEE: '📦 Archivée'
}

export default function LettreDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lettre, setLettre] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLettre()
  }, [id])

  async function fetchLettre() {
    try {
      const resp = await getLettreApi(id)
      setLettre(resp.data.data)
    } catch {
      setError('Impossible de charger la lettre')
    }
  }

  async function handleRegenerate() {
    if (!confirm('Régénérer cette lettre avec l\'IA ? (Cela écrasera la version actuelle)')) return
    setLoading(true)
    try {
      await regenerateLettreApi(id)
      fetchLettre()
    } catch {
      setError('Erreur lors de la régénération')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(e) {
    try {
      await updateLettreApi(id, { status: e.target.value })
      fetchLettre()
    } catch {
      setError('Erreur lors de la mise à jour du statut')
    }
  }

  async function handleDelete() {
    if (!confirm('Supprimer définitivement cette lettre ?')) return
    try {
      await deleteLettreApi(id)
      navigate('/lettres')
    } catch {
      setError('Erreur lors de la suppression')
    }
  }

  if (error) return <div className="container" style={{marginTop: '50px'}}><p className="error">{error}</p><Link to="/lettres" className="btn-secondary">Retour à la liste</Link></div>
  if (!lettre) return <div className="container" style={{textAlign: 'center', marginTop: '100px'}}><div className="ai-spinner" style={{margin: '0 auto'}}></div><p>Chargement de votre lettre...</p></div>

  return (
    <div className="container" style={{animation: 'fadeIn 0.5s ease-out'}}>
      <div className="page-header">
        <div>
          <h2>📄 {lettre.titre}</h2>
          <p style={{color: 'var(--text-muted)'}}>{lettre.poste} @ {lettre.entreprise}</p>
        </div>
        <Link to="/lettres" className="btn-secondary">← Retour</Link>
      </div>

      <div className="cards-grid" style={{gridTemplateColumns: 'minmax(0, 1fr) 300px', alignItems: 'start'}}>
        <div className="card cv-content" style={{padding: '0', overflow: 'hidden'}}>
          <div className="cv-preview-header" style={{background: 'var(--bg-main)', borderBottom: '1px solid var(--border)', padding: '15px 30px'}}>
             <span className="badge">Génération IA Premium</span>
          </div>
          <div className="lettre-text" style={{padding: '40px', lineHeight: '1.8', fontSize: '1.05rem', background: 'white'}}>
            {lettre.contenu ? (
              lettre.contenu.split('\n').map((line, i) => <p key={i} style={{marginBottom: '1em'}}>{line}</p>)
            ) : (
              <div className="cv-preview-empty">
                 <p>Contenu manquant. Essayez de régénérer la lettre.</p>
              </div>
            )}
          </div>
        </div>

        <div className="sidebar" style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          <div className="card" style={{padding: '24px'}}>
            <h4 style={{marginBottom: '15px'}}>⚙️ Paramètres</h4>
            <div className="form-group">
              <label>Statut</label>
              <select value={lettre.status} onChange={handleStatusChange} style={{width: '100%'}}>
                {Object.entries(STATUTS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </div>
            <div className="form-group" style={{marginTop: '15px'}}>
               <label>Ton utilisé</label>
               <input value={lettre.ton} disabled style={{background: '#f8fafc', color: '#64748b'}} />
            </div>
          </div>

          <div className="card" style={{padding: '24px', background: 'var(--bg-main)'}}>
            <h4 style={{marginBottom: '15px'}}>🛠️ Actions</h4>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
               <button className="btn-primary" onClick={handleRegenerate} disabled={loading} style={{width: '100%'}}>
                  {loading ? '⏳ Régénération...' : '🔄 Régénérer (AI)'}
               </button>
               <button className="btn-secondary" onClick={() => window.print()} style={{width: '100%'}}>🖨️ Imprimer / PDF</button>
               <hr style={{border: '0', borderTop: '1px solid var(--border)', margin: '10px 0'}} />
               <button className="btn-danger" onClick={handleDelete} style={{width: '100%'}}>🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
