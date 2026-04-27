type Props = {
  name: string;
  photoUrl: string | null;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  // Iterate by code point so emoji / non-BMP characters aren't sliced into
  // surrogate halves.
  const head = [...parts[0]];
  if (parts.length === 1) return head.slice(0, 2).join("").toUpperCase();
  const tail = [...parts[parts.length - 1]];
  return (head[0] + tail[0]).toUpperCase();
}

export default function Avatar({ name, photoUrl }: Props) {
  return (
    <div className="avatar" aria-label={name}>
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt={name} />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}
