import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="home-intro">
      <div className="home-copy">
        <span className="eyebrow">Course Enrollment System · Foundation</span>
        <h1>Make learning<br />part of the routine.</h1>
        <p>Your courses and learning space, gathered in one place.</p>
        <div className="home-actions">
          <Link className="button button-primary" href="/courses">Browse courses <span aria-hidden="true">↗</span></Link>
          <Link className="text-link" href="/login">Sign in to your account</Link>
        </div>
      </div>
      <div className="home-index" aria-hidden="true">
        <span>01</span><span>COURSE</span><span>PEOPLE</span><span>PROGRESS</span>
      </div>
    </section>
  );
}
