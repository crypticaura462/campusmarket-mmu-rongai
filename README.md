Full Name: WAYNE MUTUGI NYAGA
Admission Number: CIT-227-118/2024
Live Site: https://campusmarket-wayne.netlify.app

# CampusMarket

Semester project for CCS 2314 Web Based Programming II. A small student marketplace built up week by week — static pages, then JS filtering and a running total, then form validation, then a filtered gallery and animated feedback.

## Pages
- `index.html` — home
- `catalog.html` — product catalog, search/filter, gallery, quantity calculator
- `register.html` — account registration with validation

## How the filter and gallery connect
`app.js` loops through every product once per filter change. Anything that matches the search text and the selected category stays visible in the grid, and that same match also gets pushed into a `galleryItems` array. The gallery buttons just step through that array — they never touch the full product list, so the gallery only ever shows what's currently filtered.
