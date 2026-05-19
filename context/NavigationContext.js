import { createContext, useContext, useState } from 'react'

const NavigationContext = createContext()

export function NavigationProvider({ children }) {
  const [navLinks, setNavLinks] = useState([
    { href: '/articles', label: 'Статьи' },
    { href: '/interviews', label: 'Интервью' },
    { href: '/playlists', label: 'Плейлисты' },
    { href: '/meropriyatiya', label: 'Мероприятия' },
    { href: '/about', label: 'О нас' },
  ])
  const [accentColor, setAccentColor] = useState(undefined)

  return (
    <NavigationContext.Provider value={{ navLinks, setNavLinks, accentColor, setAccentColor }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  return useContext(NavigationContext)
}
