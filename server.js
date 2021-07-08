const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

/* google auth */
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = '212170639708-fq2hj9fi1qm5nf8pt5m9dbll7ja8h69a.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

const PORT = process.env.PORT || 3000;

//Middlewares
app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.render('index')
});

app.get('/login',(req,res)=>{
    res.render('login')
});

app.post('/login',(req,res)=>{
    let token = req.body.token;/* contiene el token que nos trae el front */
    /* console.log(token); */
    
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,/* definimos el CLIENT_ID en la linea 7 */
        });
        const payload = ticket.getPayload();/* payload contiene los datos del user */
        const userid = payload['sub'];
        /* console.log(payload) */
    }
    verify()
    .then(()=>{
        res.cookie('session-token', token);/* creamos la cookie que va a almacenar el token */
        res.send('success');
    })
    .catch(console.error);
})

app.get('/dashboard',checkAuthenticated,(req,res)=>{
    /* let user = req.user;
    res.render('dashboard', {user}); */
    res.send(req.user)
})

app.get('/protectedroute',checkAuthenticated,(req,res)=>{
    res.render('protectedroute');
})

app.get('/logout', (req,res)=>{
    res.clearCookie('session-token');
    res.redirect('/login');
})

function checkAuthenticated(req, res, next){/* middleware de auth */
    
    let token = req.cookies['session-token'];
    
    let user = {};
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
    }
    verify()
    .then(()=>{
        req.user = user;
        next();/* si pasa las auth entonces que haga next() */
    })
    .catch(err=>{
        res.redirect('/login')/* si hubo algun err en la auth que nos redirija a /login */
    })
    
}

app.listen(PORT, ()=>{
    console.log(`Servidor corriendo en el puerto ${PORT}`);
})