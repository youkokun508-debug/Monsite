import { PhoneLink } from '@/components/PhoneLink';

export default function ReservationPage() {
  return (
    <section className="section" style={{ textAlign: 'center', maxWidth: '700px' }}>
      <p className="section-subtitle">Votre table vous attend</p>
      <h1 style={{ marginBottom: '1.5rem' }}>Réserver par téléphone</h1>
      <p style={{ marginBottom: '2rem', lineHeight: 1.7 }}>Les réservations se font uniquement par téléphone. Appelez le restaurant pour choisir votre date et votre horaire avec notre équipe.</p>
      <PhoneLink className="btn btn-primary btn-lg" showNumber />
    </section>
  );
}
