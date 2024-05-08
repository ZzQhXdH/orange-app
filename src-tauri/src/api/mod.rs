use actix_web::{App, HttpServer};
use tauri::async_runtime::block_on;

use crate::error::AppErr;

pub fn run() {
    std::thread::spawn(|| {
        _ = block_on(api_serve_run());
    });
}

async fn api_serve_run() -> Result<(), AppErr> {
    let app = || {
        App::new()
    };
    HttpServer::new(app)
        .bind("0.0.0.0:0")?
        .run()
        .await?;

    Ok(())
}
