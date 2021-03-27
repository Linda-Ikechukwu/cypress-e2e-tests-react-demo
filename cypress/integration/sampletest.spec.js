/// <reference types="cypress" />

describe("Sample test for weather widget app", () => {
    beforeEach(()=>{
        cy.openApp()
        //clear localstorage so we're starting on a clean slate
        cy.clearLocalStorage("location");
    })

    //first verify that location button exists
    it("Should show button on page load", ()=>{
        cy.get('button').should('exist').and('contain','Get Current Location Weather');
    })

    //if this doesnt fail, then navigator.geolocation exists and no need to test it in other blocks
    it('should show error if navigator.geolaction does not exist', () =>{
        cy.get('button').contains('Get Current Location Weather').click();
        if(!navigator.geolocation){
            cy.get('.location-error').should('be.visible').and('contain', 'Sorry. Geolocation is not supported by this browser');
        }
    })

    it('should show alert error if navigator.geolocation.getCurrentPosition fails', () =>{
        //stub without latitude and longitude parameters to throw error
        cy.stubGeolocation();
        cy.get('button').contains('Get Current Location Weather').click()
        cy.get('.location-error').should('be.visible')
    })

    it('should store location in localstorage if navigator.geolocation.getCurrentPosition is successful and show weather data', () =>{
        cy.stubGeolocation(75,86);
        cy.get('button').contains('Get Current Location Weather').click().should(() => {
            expect(localStorage.getItem('location')).to.eq('75%2C86')
        })
        cy.get('.weather-today').should('be.visible');
        cy.get('.weather-cards').within(($cards) =>{
            cy.get('.weather-card').should('have.length', 6);
        })
    })

    it('show error if request body is empty', () => {
        cy.intercept('GET', '**/data.climacell.co/v4/timelines?location**', {}).as('getWeatherData');
        cy.get('button').contains('Get Current Location Weather').click()
        cy.wait('@getWeatherData').then(() =>{
            cy.get('.weather-app-error').should('be.visible').and('contain', 'Please try reloading the page');
        })
        cy.intercept
    }) 

    
})