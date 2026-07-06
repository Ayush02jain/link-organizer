import LinkCard from './LinkCard'

export default function LinkGrid({ links, onDelete, onUpdateTags }) {
  return (
    <div className="flex flex-col gap-3">
      {links.map((link) => (
        <LinkCard key={link.id} link={link} onDelete={onDelete} onUpdateTags={onUpdateTags} />
      ))}
    </div>
  )
}
