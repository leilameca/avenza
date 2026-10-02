import Link from "next/link";
export default function NotFound() {
  return (
    <main className="container section">
      <h1>No encontramos esta página.</h1>
      <Link className="button" href="/">
        Volver a AVENZA
      </Link>
    </main>
  );
}
