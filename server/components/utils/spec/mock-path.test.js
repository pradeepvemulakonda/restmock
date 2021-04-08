/* eslint-disable no-undef */
import { expect } from 'chai'
import { MockPathUtil } from '../mock-path.js'
import mock from 'mock-fs'

describe('Mock Path Utility', function () {
  describe('when validatePath is invoked with a valid path', function () {
    it('should not throw an error', function () {
      mock({
        'path/to/fake/dir': { 'empty-dir': {/** empty directory */} }
      })

      const mockPathUtil = new MockPathUtil('path/to/fake/dir')
      expect(() => mockPathUtil.validatePath()).to.not.throw()
      mock.restore()
    })
  })

  describe('when validatePath is invoked with a invalid path', function () {
    it('should throw an error', function () {
      mock({
        'path/to/fake/dir2': { 'empty-dir': {/** empty directory */} }
      })

      const mockPathUtil = new MockPathUtil('path/to/fake/dir')
      expect(() => mockPathUtil.validatePath()).to.throw()
      mock.restore()
    })
  })
})
