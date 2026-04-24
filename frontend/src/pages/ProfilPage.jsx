import { useState, useEffect } from 'react'
import { getProfilsApi, createProfilApi, deleteProfilApi } from '../api/profilApi'

const DEFAULT_FORM = {
  titre: '',
  competences: '',
  experiences: [{ company: '', role: '', duration: '', description: '' }],
  formations: [{ school: '', degree: '', year: '' }],
  langues: [{ language: '', level: '' }],
  isDefault: false,
}

export default function ProfilPage() {
  const [profils, setProfils] = useState([])
  const [form, setForm] = useState(DEFAULT_FORM)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { fetchProfils() }, [])

  async function fetchProfils() {
    try {
      const resp = await getProfilsApi()
      setProfils(resp.data.data || [])
    } catch {
      setError('Impossible de charger les profils')
    }
  }

  function updateArrayField(field, index, key, value) {
    const updated = [...form[field]]
    updated[index] = { ...updated[index], [key]: value }
    setForm({ ...form, [field]: updated })
  }

  function addArrayItem(field, template) {
    setForm({ ...form, [field]: [...form[field], template] })
  }

  function removeArrayItem(field, index) {
    const updated = form[field].filter((_, i) => i !== index)
    setForm({ ...form, [field]: updated.length ? updated : [form[field][0]] })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        titre: form.titre,
        competences: form.competences.split(',').map(c => c.trim()).filter(Boolean),
        experiences: form.experiences.filter(ex => ex.company || ex.role),
        formations: form.formations.filter(f => f.school || f.degree),
        langues: form.langues.filter(l => l.language),
        isDefault: form.isDefault,
      }
      await createProfilApi(payload)
      setForm(DEFAULT_FORM)
      setShowForm(false)
      fetchProfils()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce profil ?')) return
    try {
      await deleteProfilApi(id)
      fetchProfils()
    } catch {
      setError('Erreur lors de la suppression')
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2>👤 Mes Profils Professionnels</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : '+ Nouveau profil'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {showForm && (
        <div className="card ai-form-card">
          <h3>🚀 Créer un profil complet</h3>
          <p className="ai-hint" style={{background: 'var(--primary-light)', color: 'var(--primary)'}}>
            Plus votre profil est complet, meilleures seront les réponses de l'IA pour vos CV et lettres.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Titre du profil *</label>
                <input
                  value={form.titre}
                  onChange={e => setForm({ ...form, titre: e.target.value })}
                  placeholder="Ex: Développeur Full Stack Senior"
                  required
                />
              </div>
              <div className="form-group">
                <label>Compétences (tags séparés par des virgules)</label>
                <input
                  value={form.competences}
                  onChange={e => setForm({ ...form, competences: e.target.value })}
                  placeholder="React, Node.js, AWS, SQL"
                />
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-header">
                <strong>💼 Expériences professionnelles</strong>
                <button type="button" className="btn-sm btn-secondary"
                  onClick={() => addArrayItem('experiences', { company: '', role: '', duration: '', description: '' })}>
                  + Ajouter une expérience
                </button>
              </div>
              {form.experiences.map((exp, i) => (
                <div key={i} className="array-item">
                  <div className="array-item-header">
                    <span>Expérience #{i + 1}</span>
                    <button type="button" className="btn-remove" onClick={() => removeArrayItem('experiences', i)}>✕</button>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Entreprise</label>
                      <input value={exp.company} onChange={e => updateArrayField('experiences', i, 'company', e.target.value)} placeholder="Nom de l'entreprise" />
                    </div>
                    <div className="form-group">
                      <label>Poste occupé</label>
                      <input value={exp.role} onChange={e => updateArrayField('experiences', i, 'role', e.target.value)} placeholder="Titre du poste" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Durée & Description</label>
                    <div className="form-row">
                      <input value={exp.duration} onChange={e => updateArrayField('experiences', i, 'duration', e.target.value)} placeholder="Ex: Jan 2020 - Oct 2023" style={{flex: '0 0 200px'}} />
                      <textarea rows={1} value={exp.description} onChange={e => updateArrayField('experiences', i, 'description', e.target.value)} placeholder="Décrivez brièvement vos missions..." />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="form-row">
               <div className="form-group" style={{flex: 1}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 0'}}>
                    <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} style={{width: 'auto'}} />
                    Définir comme profil par défaut
                  </label>
               </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{width: '100%'}}>
              {loading ? 'Enregistrement...' : '💾 Enregistrer mon profil professionnel'}
            </button>
          </form>
        </div>
      )}

      {profils.length === 0 ? (
        <div className="cv-preview-empty">
          <div className="cv-preview-icon">👤</div>
          <p>Vous n'avez pas encore de profil. C'est la première étape pour utiliser l'IA !</p>
        </div>
      ) : (
        <div className="cards-grid">
          {profils.map((p) => (
            <div key={p.id} className="card">
              <div className="card-header">
                <div>
                  <h3 style={{margin: 0}}>{p.titre}</h3>
                  {p.isDefault && <span className="badge" style={{marginTop: '5px', display: 'inline-block'}}>⭐ Principal</span>}
                </div>
                <button className="btn-danger btn-sm" onClick={() => handleDelete(p.id)}>🗑️</button>
              </div>

              <div className="tags" style={{margin: '15px 0'}}>
                {p.competences?.map((c, i) => <span key={i} className="tag">{c}</span>)}
              </div>

              <div className="profil-section" style={{fontSize: '0.9rem'}}>
                <strong>💼 {p.experiences?.length} Expériences</strong>
                <p style={{color: 'var(--text-muted)', marginTop: '4px'}}>
                  {p.experiences?.[0]?.role} @ {p.experiences?.[0]?.company}...
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
