import { listen } from './app'

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3000

listen(PORT, () => {
  console.log(`API listening on port ${PORT}`)
})
