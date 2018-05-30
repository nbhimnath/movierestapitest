//
// **** The Movie Database REST API Tests ****
//

describe('HTTP-Status Code test', function (){

  it('checks HTTP-Status Code 200', function() {
    cy.request({url: '/', failOnStatusCode: false, qs: {api_key: Cypress.env("api_key")}}).
      then(function(resp) {
      // check status code is 200
      expect(resp.status).to.eq(200)
      })
  })    

  it('checks HTTP-Status Code 401', function() {
    // Wrong API Key for 
    cy.request({url: '/', failOnStatusCode: false, qs: {api_key: 'wrong_key'}}).
      then(function(response) {
      //check status code is 401
      expect(response.status).to.eq(401)
      })
  })  

  it('checks HTTP-Status Code 404', function() {
    //URL has '/tada' in path 
    cy.request({url: '/tada', failOnStatusCode: false, qs: {api_key: Cypress.env("api_key")}}).
      then(function(response) {
      // check status code is 404
      expect(response.status).to.eq(404)
      })
  })  

  it('checks Content-Type JSON', () => {
    cy.request({url: '/', qs: {api_key: Cypress.env("api_key")}})
      .its('headers')
      .its('content-type')
      .should('include', 'application/json')
  })

})  

const movies = () =>
    cy.request({url: '/', qs: {api_key: Cypress.env("api_key"),language: 'en-US', sort_by: 'popularity.desc', include_adult: 'false', include_video: 'false',primary_release_year: '2018', page: '1'}})
      .its('body.results')

const future_movies = () =>
    cy.request({url: '/', qs: {api_key: Cypress.env("api_key"),language: 'en-US', sort_by: 'popularity.desc', include_adult: 'false', include_video: 'false',primary_release_year: '2020', page: '5'}})
      .its('body.results') 

describe('Assertion Based Positive & Negative tests', function (){

  it('check movies are returned for a future year ', () => {    
    cy.request({url: '/', qs: {api_key: Cypress.env("api_key"),language: 'en-US', sort_by: 'popularity.desc', include_adult: 'false', include_video: 'false',primary_release_year: '2020', page: '5'}}).then((response) => {
            expect(response.body.results[0].title).to.exist
    })
  })

  it('check no movies are returned for a future year with page number greater than total pages ', () => {    
    cy.request({url: '/', qs: {api_key: Cypress.env("api_key"),language: 'en-US', sort_by: 'popularity.desc', include_adult: 'false', include_video: 'false',primary_release_year: '2022', page: '5'}}).then((response) => {
            expect(response.body.results).to.be.empty  
    })
  })

  it('check movie id exists in each result', () => {
    movies()
      .each(movie =>
        expect(movie).to.have.any.keys('id')
      )
  })

  it('Fail if poster_path is null ', () => {    
    //Check movies that are yet to be released, make sure they have poster_path 
     future_movies()
      .each(movie =>
            assert.isNotNull(movie.poster_path, 'poster_path cannot be null')
      )
  })

  it('Fail if a movie is found when using wihout_keyword contains the keyword in title  ', () => { 
    //Discover movie without keyword 'Thor' and fail the test if a movie with Thor in its title is returned in the results
    cy.request('https://api.themoviedb.org/3/discover/movie?api_key=8e1cae9b4abe1cae1f381cec74d1919b&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&without_keywords=Thor').its('body.results')
    .each(movie =>
          expect(movie.title).to.not.include('Thor')
    )
  })

})


describe('Data type validation tests', function (){

  it('test movie title is a String ', () => {
    movies()
      .each(movie =>
            assert.isString(movie.title, 'movie title is string')
      )
  })

  it('test genre ids is not Null ', () => {
    movies()
      .each(movie =>
            assert.isNotNull(movie.genre_ids, 'Genre Id is not null')
      )
  })


  it('test no adult movies are returned ', () => {
    // As movies have include_adult=false as query string
    movies()
      .each(movie =>
                expect(movie.adult).to.be.false
      )
  })

  it('test vote_count is a number', () => {
    movies()
      .each(movie =>
                assert.isNumber(movie.vote_count, 'vote_count value is number')
      )
  })

  it('test vote_average is a number', () => {
    movies()
      .each(movie =>
                assert.isNumber(movie.vote_average, 'vote_average value is number')
      )
  })

  it('test popularity is a number', () => {
    movies()
      .each(movie =>
                assert.isNumber(movie.popularity, 'popularity value is number')
      )
  })

  it('test date format for all movies is yyyy-mm-dd', () => {
    movies()
      .each(movie =>
                  expect(movie.release_date).to.match(/^\d{4}-\d{2}-\d{2}$/)     
      )
  })

})  