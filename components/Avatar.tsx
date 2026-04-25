type Props = {
  name: string;
  photoUrl: string | null;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
