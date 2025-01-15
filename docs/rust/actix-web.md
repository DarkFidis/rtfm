# Actix Web

## Installation

1. Création du projet

```shell
cargo init my_project
cd my_project
```

2. Dans le fichier `Cargo.toml`, insérer la dépendance : 

```toml
[dependencies]
actix-web = "4"
```

## Basics

### Implémentation du serveur

```
use actix_web::{web, App, HttpServer, Responder};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(my_service)
            .route("/hey", web::get().to(manual_hello))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

### Implémentation d'une route

```
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};

#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

#[post("/echo")]
async fn echo(req_body: String) -> impl Responder {
    HttpResponse::Ok().body(req_body)
}
```