
const {tap,map, mergeMap, catchError, }  = require('rxjs/operators');
const {from, forkJoin, of}  = require('rxjs');
const {RxHR} = require ("@akanass/rx-http-request");
var https = require('https');
const express = require('express')
const app = express()
const port = 3000


 app.get('/posts',(req, res) => {
   
      RxHR.get('https://jsonplaceholder.typicode.com/posts')
      .pipe(
        map(datos => datos.body),
        map(datos => JSON.parse(datos) )
      )
      .subscribe(async (datos1) => {
        let start = req.query.start;
        let size = req.query.size
        let x = Number(start) + Number(size);
        let pp = datos1.slice(start, x);
        let authors = [];
        let comments = [];
        let final = [];
       pp.forEach(data => {
            final.push(RxHR.get(`https://jsonplaceholder.typicode.com/users/${data.userId}`))
            comments.push(RxHR.get(`https://jsonplaceholder.typicode.com/posts/${data.id}/comments`))
        })
        forkJoin(final).subscribe(autores => { 
            forkJoin(comments).subscribe(comentarios => {
                
                let commentariosF = []
                comentarios.forEach(comentario => {
                    let comentA = JSON.parse(comentario.body);
                    comentA.forEach(comentAs => {
                        commentariosF.push(comentAs)
                    })
                 }
                )
                autores.forEach(autore => {
                    let aut = JSON.parse(autore.body);
                    authors.push(aut)
                })
                pp.forEach(p => {
                    p.comment = commentariosF.filter(comentarioin => comentarioin.postId == p.id);
                    p.autor =  authors.find(autor => p.userId == autor.id)
                 })
                res.send(pp);
            },
            (error) => {console.log("error >> ",error); res.send(error);})
        }, 
        (error) => {console.log("error >> ",error); res.send(error);}  )
        },
        err => {console.log(err); res.send(err);} )
    })
  

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

