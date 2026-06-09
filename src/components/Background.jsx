export default function Background() {
  return (
    <>
      <div className="bg-base" aria-hidden="true" />
      <div id="bg-mesh" className="bg-aurora" aria-hidden="true">
        <div className="aurora aurora-a" />
        <div className="aurora aurora-b" />
        <div className="aurora aurora-c" />
      </div>
      <div id="bg-grid" aria-hidden="true" />
      <div className="bg-vignette" aria-hidden="true" />
    </>
  );
}
