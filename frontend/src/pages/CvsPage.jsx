import { useState, useEffect } from 'react'
import { getCvsApi, createCvApi, deleteCvApi, getCvByIdApi } from '../api/cvApi'
import { getProfilsApi } from '../api/profilApi'

export default function CvsPage() {
  const [cvs, setCvs] = useState([])
  const [profils, setProfils] = useState([])
  const [form, setForm] = useState({ titre: '', profilId: '', templateId: 'classic' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedCv, setSelectedCv] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  useEffect(() => {
    fetchCvs()
    fetchProfils()
  }, [])

  async function fetchCvs() {
    try {
      const resp = await getCvsApi()
      const list = resp.data.data?.cvs || resp.data.data || []
      setCvs(list)
    } catch {
      setError('Impossible de charger les CVs')
    }
  }

  async function fetchProfils() {
    try {
      const resp = await getProfilsApi()
      const list = resp.data.data || []
      setProfils(list)
      if (list.length > 0) setForm(f => ({ ...f, profilId: list[0].id }))
    } catch {
      setError('Impossible de charger les profils')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createCvApi(form)
      setShowForm(false)
      setForm(f => ({ ...f, titre: '', templateId: 'classic' }))
      fetchCvs()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la génération')
    } finally {
      setLoading(false)
    }
  }

  async function handlePreview(id) {
    setPreviewLoading(true)
    setSelectedCv(null)
    try {
      const resp = await getCvByIdApi(id)
      setSelectedCv(resp.data.data)
    } catch {
      setError('Impossible de charger le CV')
    } finally {
      setPreviewLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce CV ?')) return
    try {
      await deleteCvApi(id)
      if (selectedCv?.id === id) setSelectedCv(null)
      fetchCvs()
    } catch {
      setError('Erreur lors de la suppression')
    }
  }

  const templateLabels = { classic: '📄 Classique', modern: '✨ Moderne', minimal: '🎯 Minimal' }

  return (
    <div className="container">
      <div className="page-header">
        <h2>🤖 Mes CVs Générés par IA</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)} disabled={profils.length === 0}>
          {profils.length === 0 ? 'Créez un profil d\'abord' : showForm ? 'Annuler' : '+ Générer un CV'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {showForm && (
        <div className="card ai-form-card">
          <h3>🚀 Générer un CV avec l'IA</h3>
          <p className="ai-hint">L'IA va analyser votre profil et créer un CV professionnel optimisé.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Titre du CV *</label>
              <input
                value={form.titre}
                onChange={e => setForm({ ...form, titre: e.target.value })}
                placeholder="Ex: CV pour poste Développeur Senior"
                required
              />
            </div>
            <div className="form-group">
              <label>Profil source *</label>
              <select value={form.profilId} onChange={e => setForm({ ...form, profilId: e.target.value })} required>
                {profils.map(p => <option key={p.id} value={p.id}>{p.titre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Template visuel</label>
              <div className="template-grid">
                {Object.entries(templateLabels).map(([key, label]) => (
                  <div
                    key={key}
                    className={`template-option ${form.templateId === key ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, templateId: key })}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary btn-ai" disabled={loading}>
              {loading ? (
                <span className="ai-loading">
                  <span className="ai-spinner"></span>
                  L'IA génère votre CV...
                </span>
              ) : '🤖 Générer avec l\'IA'}
            </button>
          </form>
        </div>
      )}

      {loading && (
        <div className="ai-progress-bar">
          <div className="ai-progress-fill"></div>
        </div>
      )}

      <div className="cv-layout">
        {/* CV List */}
        <div className="cv-list">
          {cvs.length === 0 ? (
            <p className="empty-msg">Aucun CV généré. Cliquez sur "+ Générer un CV" pour commencer !</p>
          ) : (
            cvs.map(cv => (
              <div
                key={cv.id}
                className={`cv-item card ${selectedCv?.id === cv.id ? 'cv-item-active' : ''}`}
                onClick={() => handlePreview(cv.id)}
              >
                <div className="cv-item-header">
                  <div>
                    <h4>{cv.titre}</h4>
                    <span className="badge">{templateLabels[cv.templateId] || cv.templateId}</span>
                  </div>
                  <button
                    className="btn-danger btn-sm"
                    onClick={e => { e.stopPropagation(); handleDelete(cv.id) }}
                  >🗑️</button>
                </div>
                <p className="cv-date">📅 {new Date(cv.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            ))
          )}
        </div>

        {/* CV Preview */}
        <div className="cv-preview-panel">
          {previewLoading ? (
            <div className="cv-preview-loading">
              <span className="ai-spinner large"></span>
              <p>Chargement du CV...</p>
            </div>
          ) : selectedCv ? (
            <div className={`cv-preview cv-template-${selectedCv.templateId}`}>
              <div className="cv-preview-header">
                <h3>{selectedCv.titre}</h3>
                <span className="badge">{templateLabels[selectedCv.templateId]}</span>
              </div>
              <div className="cv-content">
                <pre>{selectedCv.contenu}</pre>
              </div>
            </div>
          ) : (
            <div className="cv-preview-empty">
              <div className="cv-preview-icon">📄</div>
              <p>Sélectionnez un CV pour voir son contenu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
