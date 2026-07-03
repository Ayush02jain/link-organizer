import LinkCard from './LinkCard'

export default function LinkGrid({ links, onDelete, onUpdateTags }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {links.map((link) => (
        <LinkCard key={link.id} link={link} onDelete={onDelete} onUpdateTags={onUpdateTags} />
      ))}
    </div>
  )
}
