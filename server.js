// *** Express setup ***
import express from 'express'
import fetchJson from './helpers/fetch-json.js'

const 
    app = express(),
    apiUrl = 'https://redpers.nl/wp-json/wp/v2/',
    directus_url = 'https://fdnd-agency.directus.app/items/redpers_shares',
    categories = [
        {"id": 9, "name": "Binnenland", "slug": "binnenland"},
        {"id": 1010, "name": "Buitenland", "slug": "buitenland"}, 
        {"id": 7164, "name": "Column", "slug": "column"},
        {"id": 6, "name": "Economie", "slug": "economie"},
        {"id": 4, "name": "Kunst & Media", "slug": "kunst-media"},
        {"id": 3211, "name": "Podcasts", "slug": "podcast"},
        {"id": 63, "name": "Politiek", "slug": "politiek"},
        {"id": 94, "name": "Wetenshap", "slug": "wetenschap"},
    ];

app.set('view engine', 'ejs')
app.set('views', './views')
app.set('port', process.env.PORT || 8000)
app.use(express.static('./public'))
app.use(express.urlencoded({extended: true}))

// *** Routes ***

//Index route
app.get('/', (_, res) => {
    const fetchRequests = [fetchJson(`${apiUrl}posts?per_page=4`)]; // de 4 meest recente posts
    
    categories.forEach((category) => { // voeg voor elke category een extra fetch request toe
        fetchRequests.push(fetchJson(`${apiUrl}posts?per_page=3&categories=${category.id}`)); // de 3 meest recente posts van elke categorie
    });

    Promise.all(fetchRequests).then(posts => {  // Promise.all uitleg onderaan. posts is een array van arrays van posts.
        res.render('index', {posts, categories})
    })
})

//Author route
app.get('/author/:id', (req, res) => {
    fetchJson(`${apiUrl}posts?author=${req.params.id}`).then((posts) => {
        res.render('author', {posts, categories})
    })
})

// Post route
app.get('/post/:slug', (req, res) => {
    Promise.all([
        fetchJson(`${apiUrl}posts?slug=${req.params.slug}`),
        fetchJson(`${directus_url}?filter[slug][_eq]=${req.params.slug}`)
    ]).then(([[post], {data}]) => {
        res.render('article', {post, shares: data[0]?.shares || 0, categories});
    })
})

// Share route
app.post('/post/:slug', (req, res) => {
    // Dit moet 1 voor 1, want we moeten eerst weten hoevaak de post is gedeeld voordat we daar 1 bij optellen
    fetchJson(`${directus_url}?filter[slug][_eq]=${req.params.slug}`).then(({data}) => {
        fetchJson(`${directus_url}/${data[0]?.id ? data[0].id : ''}`, {
            method: data[0]?.id ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                slug: req.params.slug,
                shares: data.length > 0 ? data[0].shares + 1 : 1,
            }),
        }).then(() => {
            res.redirect(301, `/post/${req.params.slug}`);
        });
    })
})

// catogory page
app.get('/categorie/:slug', (req, res) => {
	const category = categories.find((category) => category.slug == req.params.slug);
	// Vind de categorie, waarvan de slug gelijk is aan de aangevraagde slug.
	Promise.all([
        fetchJson(`${apiUrl}posts?categories=${category.id}`), 
        fetchJson(apiUrl+ 'categories?slug=' + req.params.slug)
    ]).then(([posts, category]) => { 
		res.render('category', {posts, category, categories});
	})
})

app.listen(app.get('port'), () => {
    console.log(`Application started on http://localhost:${app.get('port')}`)
})

// *** Bronnen en uitleg ***

// Promise all zorgt ervoor dat je verschillende fetchjson requests tegelijk kan doen, door een grote belofte te maken van een lijst kleinere beloftes. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#promise_concurrency
// ?. : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining