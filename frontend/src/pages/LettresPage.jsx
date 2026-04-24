import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getLettresApi, createLettreApi, deleteLettreApi } from '../api/lettreApi'
import { getProfilsApi } from '../api/profilApi'

const TONS = {
  PROFESSIONNEL: '👔 Professionnel',
  DYNAMIQUE: '🚀 Dynamique',
  CREATIF: '🎨 Créatif',
  FORMEL: '📜 Formel'
}

export default function LettresPage() {
  const [lettres, setLettres] = useState([])
  const [profils, setProfils] = useState([])
  const [form, setForm] = useState({ titre: '', poste: '', entreprise: '', ton: 'PROFESSIONNEL', profilId: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchLettres()
    fetchProfils()
  }, [])

  async function fetchLettres() {
    try {
      const resp = await getLettresApi()
      const list = resp.data.data?.lettres || resp.data.data || []
      setLettres(list)
    } catch {
      setError('Impossible de charger les lettres')
    }
  }

  async function fetchProfils() {
    try {
      const resp = await getProfilsApi()
      const list = resp.data.data || []
      setProfils(list)
      if (list.length > 0 && !form.profilId) {
        setForm(f => ({ ...f, profilId: list[0].id }))
      }
    } catch {}
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createLettreApi(form)
      setForm({ titre: '', poste: '', entreprise: '', ton: 'PROFESSIONNEL', profilId: form.profilId })
      setShowForm(false)
      fetchLettres()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la génération')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cette lettre ?')) return
    try {
      await deleteLettreApi(id)
      fetchLettres()
    } catch {
      setError('Erreur lors de la suppression')
    }
  }

  const statusLabel = (status) => {
    const map = { BROUILLON: '📝 Brouillon', FINALE: '✅ Finale', ENVOYEE: '📤 Envoyée', ARCHIVEE: '📦 Archivée' }
    return map[status] || status
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2>✉️ Mes Lettres de Motivation</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : '+ Rédiger une lettre'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {showForm && (
        <div className="card ai-form-card">
          <h3>🚀 Générer une lettre avec l'IA</h3>
          <div className="ai-hint">
            L'IA va coupler votre profil avec les détails du poste pour créer une lettre personnalisée.
          </div>
          
          {profils.length === 0 ? (
            <div className="warning">
              ⚠️ Vous devez d'abord créer un profil pour que l'IA puisse s'en inspirer. 
              <Link to="/profils" style={{color: 'inherit', fontWeight: 'bold', marginLeft: '5px'}}>Créer un profil →</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Titre de la candidature *</label>
                  <input name="titre" value={form.titre} onChange={handleChange} placeholder="Ex: Candidature chez Google" required />
                </div>
                <div className="form-group">
                   <label>Poste visé *</label>
                   <input name="poste" value={form.poste} onChange={handleChange} placeholder="Ex: Software Engineer" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Entreprise *</label>
                  <input name="entreprise" value={form.entreprise} onChange={handleChange} placeholder="Ex: Google Inc." required />
                </div>
                <div className="form-group">
                  <label>Ton de rédaction</label>
                  <select name="ton" value={form.ton} onChange={handleChange}>
                    {Object.entries(TONS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Profil source</label>
                <select name="profilId" value={form.profilId} onChange={handleChange} required>
                  {profils.map((p) => <option key={p.id} value={p.id}>{p.titre}</option>)}
                </select>
              </div>

              <button type="submit" className="btn-primary btn-ai" disabled={loading}>
                {loading ? (
                  <span className="ai-loading">
                    <span className="ai-spinner"></span>
                    L'IA rédige votre lettre...
                  </span>
                ) : '🤖 Générer avec l\'IA'}
              </button>
            </form>
          )}
        </div>
      )}

      {lettres.length === 0 ? (
        <div className="cv-preview-empty">
           <div className="cv-preview-icon">✉️</div>
           <p>Aucune lettre pour le moment. L'IA attend vos instructions !</p>
        </div>
      ) : (
        <div className="cards-grid">
          {lettres.map((l) => (
            <div key={l.id} className="card">
              <div className="card-header">
                <div>
                  <h4 style={{fontSize: '1.1rem', color: 'var(--text-main)'}}>{l.titre}</h4>
                  <p style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>{l.poste} @ {l.entreprise}</p>
                </div>
                <span className="badge">{statusLabel(l.status)}</span>
              </div>
              
              <div className="card-actions" style={{marginTop: '20px', justifyContent: 'space-between'}}>
                <Link to={`/lettres/${l.id}`} className="btn-secondary" style={{flex: 1, textAlign: 'center'}}>Voir l'aperçu</Link>
                <button className="btn-danger" onClick={() => handleDelete(l.id)} style={{padding: '10px 15px'}}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
