import LinkCard from './LinkCard'

export default function LinkGrid({ links, onDelete, onUpdate }) {
  return (
    <div className="flex flex-col gap-3">
      {links.map((link) => (
        <LinkCard key={link.id} link={link} onDelete={onDelete} onUpdate={onUpdate} />
      ))}
    </div>
  )
}
