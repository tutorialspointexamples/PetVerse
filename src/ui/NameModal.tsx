import { useState, type FormEvent } from 'react'
import { useGameStore } from '../state/gameStore'

export function NameModal() {
  const named = useGameStore((s) => s.named)
  const setPetName = useGameStore((s) => s.setPetName)
  const [value, setValue] = useState('')

  if (named) return null

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setPetName(value || 'Pip')
  }

  return (
    <div className="name-overlay" role="dialog" aria-label="Name your pet">
      <form className="name-card" onSubmit={onSubmit}>
        <p className="brand hero-brand">PetVerse</p>
        <h1>Meet your new friend</h1>
        <p className="name-copy">Give them a name, then feed, play, and talk with them.</p>
        <label className="name-label" htmlFor="pet-name">
          Pet name
        </label>
        <input
          id="pet-name"
          className="name-input"
          maxLength={16}
          placeholder="e.g. Pip"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <button type="submit" className="name-submit">
          Start caring
        </button>
      </form>
    </div>
  )
}
