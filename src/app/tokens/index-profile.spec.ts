import { INDEX_PROFILE_TOKEN } from './index-profile'

describe('INDEX_PROFILE_TOKEN', () => {
  it('should create an instance', () => {
    expect(INDEX_PROFILE_TOKEN.toString()).toContain('profile.id')
  })
})
