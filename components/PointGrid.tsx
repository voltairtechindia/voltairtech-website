/**
 * The "what you get" points, as a grid of numbered cards rather than a bullet
 * list buried in the body copy. Short lines only: anything that needs a
 * paragraph belongs in the prose below it.
 */
export function PointGrid({
  points,
  heading = "What you get",
  lede,
}: {
  points: string[];
  heading?: string;
  lede?: string;
}) {
  if (!points.length) return null;
  return (
    <section className="pgrid" aria-label={heading}>
      <header className="pgrid__head">
        <h2 className="pgrid__title">{heading}</h2>
        {lede ? <p className="pgrid__lede">{lede}</p> : null}
      </header>
      <ul className="pgrid__list">
        {points.map((p, i) => (
          <li key={p} className="pgrid__item">
            <span className="pgrid__num">{String(i + 1).padStart(2, "0")}</span>
            <span className="pgrid__text">{p}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
