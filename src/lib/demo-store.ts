import { Store } from '@tanstack/store'

export const store = new Store({
  firstName: 'Jane',
  lastName: 'Smith',
})

export function getFullName() {
  return `${store.state.firstName} ${store.state.lastName}`
}
