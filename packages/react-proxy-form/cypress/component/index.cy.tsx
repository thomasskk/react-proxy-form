import React from 'react'
import { mount } from 'cypress/react'
import { Form } from './Form'

describe('cypress', () => {
  it('unmount and remount input depending of a watched value', () => {
    const cb = cy.spy().as('cb')
    mount(<Form cb={cb} />)

    cy.get('input[name="individual"]').should('exist')
    cy.get('input[name="company"]').should('not.exist')

    cy.get('[type="radio"]').check(['company'])

    cy.get('input[name="individual"]').should('not.exist')
    cy.get('input[name="company"]').should('exist')

    cy.get('[type="radio"]').check(['individual'])

    cy.get('input[name="individual"]').should('exist')
    cy.get('input[name="company"]').should('not.exist')

    cy.get('[type="radio"]').check(['company'])
    cy.get('input[name="company"]').type('aa')
    cy.get('button').click()

    cy.get('form').should('contain', 'company error')
    cy.get('form').should('not.contain', 'success')

    cy.get('input[name="company"]').type('aaaaa')
    cy.get('form').should('not.contain', 'company error')

    cy.get('button').click()
    cy.get('@cb').should('have.been.calledWith', {
      company: 'aaaaaaa',
      status: 'company',
    })
  })
})
