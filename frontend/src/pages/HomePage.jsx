import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="container">
      <div className="hero">
        <h1>
          Propulsez votre carrière avec <span>l'IA</span> 
        </h1>
        <p>
          Bienvenue, {user?.firstName}. Prêt à décrocher votre prochain job ? 
          Générez des CV et des lettres de motivation percutants en quelques secondes.
        </p>
      </div>

      <div className="cards-grid">
        <div className="card">
          <div className="card-icon" style={{fontSize: '2rem', marginBottom: '15px'}}>👤</div>
          <h3>Mon Profil</h3>
          <p>Gardez vos compétences et expériences à jour pour une personnalisation parfaite par l'IA.</p>
          <div style={{marginTop: '20px'}}>
            <Link to="/profils" className="btn-primary">Mettre à jour</Link>
          </div>
        </div>

        <div className="card">
          <div className="card-icon" style={{fontSize: '2rem', marginBottom: '15px'}}>📄</div>
          <h3>Générateur de CV</h3>
          <p>Créez des CV modernes et optimisés ATS à partir de vos informations de profil.</p>
          <div style={{marginTop: '20px'}}>
            <Link to="/cvs" className="btn-primary">Générer un CV</Link>
          </div>
        </div>

        <div className="card">
          <div className="card-icon" style={{fontSize: '2rem', marginBottom: '15px'}}>✉️</div>
          <h3>Lettres de Motivation</h3>
          <p>Rédigez des lettres captivantes et personnalisées pour chaque offre d'emploi.</p>
          <div style={{marginTop: '20px'}}>
            <Link to="/lettres" className="btn-primary">Rédiger une lettre</Link>
          </div>
        </div>
        
        <div className="card">
          <div className="card-icon" style={{fontSize: '2rem', marginBottom: '15px'}}>🔍</div>
          <h3>Offres d'Emploi</h3>
          <p>Sauvegardez les offres qui vous intéressent pour adapter vos documents plus tard.</p>
          <div style={{marginTop: '20px'}}>
            <Link to="/offres" className="btn-primary">Voir les offres</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
